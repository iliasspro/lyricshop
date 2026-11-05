"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  FlaskConical,
  LoaderCircle,
  Lock,
  Package,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS, computeTotals, formatPrice, type ShippingMethodId, type Totals } from "@/lib/pricing";
import { cartCount, useCart, type CartLine } from "@/lib/store/cart";
import { useLibrary, type Address, type Order } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";
import { PRODUCTION_DAYS, addBusinessDays, formatDateRange, shippingMethod, transitDays } from "./delivery";
import { Field, SelectInput, TextInput } from "./form-fields";
import { PromoField } from "./promo-field";
import {
  ADDRESS_FIELDS,
  COUNTRIES,
  EMPTY_ADDRESS,
  cleanAddress,
  countryFor,
  regionName,
  toCheckoutLine,
  validateAddress,
  validateEmail,
  type AddressField,
  type CheckoutRequestBody,
  type CheckoutResponse,
} from "./schema";
import { CheckoutSkeleton } from "./skeletons";
import { clearPendingOrder, loadCheckoutDetails, loadPendingOrder, saveCheckoutDetails, savePendingOrder } from "./storage";
import { EmptyState, LineList, TotalsList } from "./summary-bits";

type Step = "contact" | "shipping" | "payment";

const STEPS: { id: Step; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
];

const stepIndex = (s: Step) => STEPS.findIndex((x) => x.id === s);

type Quote = { totals: Totals; unitPrices: number[] };

type Pay =
  | { status: "idle" }
  | { status: "loading"; key: string }
  | { status: "ready"; key: string; quote: Quote }
  | { status: "error"; key: string; message: string }
  | { status: "redirecting" }
  | { status: "placing"; order: Order };

const EASE = [0.16, 1, 0.3, 1] as const;

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -28 }),
};

const money = (n: number) => formatPrice(n, { cents: true });

/** Prefill: details used last time on this device, then the profile, then the latest order. */
function initialDetails() {
  const saved = loadCheckoutDetails();
  const { profile, orders } = useLibrary.getState();
  const last = orders[0];
  const [first = "", ...rest] = (profile?.name ?? "").trim().split(/\s+/);
  const address: Address = {
    ...EMPTY_ADDRESS,
    ...(saved?.address ?? last?.address ?? { firstName: first, lastName: rest.join(" ") }),
  };
  const email = saved?.email || profile?.email || last?.email || "";
  const method: ShippingMethodId = saved?.method ?? last?.method ?? "standard";
  // Coming back from Stripe without paying: skip straight to payment if the details still check out.
  const resume = !!loadPendingOrder() && !validateEmail(email) && ADDRESS_FIELDS.every((f) => !validateAddress(address)[f]);
  return { email, address, method, resume, now: Date.now() };
}

/** Identifies what a quote was priced for, so a changed bag or address invalidates it. */
function quoteKey(lines: CartLine[], promo: string | null, method: ShippingMethodId, email: string, address: Address) {
  return JSON.stringify([lines.map((l) => [l.key, l.qty]), promo, method, email.trim(), cleanAddress(address)]);
}

/**
 * The order record, priced with the server's quote rather than the bag's own prices.
 * Stamped with the current time, so only call it from event handlers.
 */
function buildOrder(
  base: { id: string; paid: Order["paid"]; quote: Quote },
  checkout: { lines: CartLine[]; email: string; address: Address; method: ShippingMethodId; promo: string | null },
): Order {
  return {
    id: base.id,
    createdAt: Date.now(),
    email: checkout.email.trim(),
    address: cleanAddress(checkout.address),
    method: checkout.method,
    lines: checkout.lines.map((l, i) => ({ ...l, unitPrice: base.quote.unitPrices[i] ?? l.unitPrice })),
    totals: base.quote.totals,
    promo: checkout.promo,
    status: "confirmed",
    paid: base.paid,
  };
}

function randomOrderId(taken: Set<string>): string {
  let id: string;
  do {
    id = `LS-${Array.from({ length: 6 }, () => Math.floor(Math.random() * 36).toString(36)).join("").toUpperCase()}`;
  } while (taken.has(id));
  return id;
}

export function CheckoutFlow() {
  const hydrated = useUI((s) => s.hydrated);
  const hasLines = useCart((s) => s.lines.length > 0);
  const [placed, setPlaced] = useState(false);

  // Cache Components keeps this page alive (hidden) after we navigate to the confirmation.
  // Forget the finished order when that happens so the next visit starts from the bag.
  useLayoutEffect(() => () => setPlaced(false), []);

  if (!hydrated) return <CheckoutSkeleton />;
  if (!hasLines && !placed) return <EmptyCheckout />;
  return (
    <MotionConfig reducedMotion="user">
      <CheckoutForm onPlaced={() => setPlaced(true)} />
    </MotionConfig>
  );
}

function CheckoutForm({ onPlaced }: { onPlaced: () => void }) {
  const router = useRouter();
  const uid = useId();
  const lines = useCart((s) => s.lines);
  const promo = useCart((s) => s.promo);
  const clearCart = useCart((s) => s.clear);
  const addOrder = useLibrary((s) => s.addOrder);
  const setProfile = useLibrary((s) => s.setProfile);

  // This component mounts only after the stores hydrate, so the initialiser sees saved details.
  const [initial] = useState(initialDetails);
  const [step, setStep] = useState<Step>(initial.resume ? "payment" : "contact");
  const [reached, setReached] = useState(initial.resume ? 2 : 0);
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState(initial.email);
  const [address, setAddress] = useState<Address>(initial.address);
  const [method, setMethod] = useState<ShippingMethodId>(initial.method);
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [attempted, setAttempted] = useState({ contact: false, shipping: false });
  const [pay, setPay] = useState<Pay>({ status: "idle" });
  const [resumed, setResumed] = useState(initial.resume);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const request = useRef(0);
  const focusNextStep = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  // The pending Stripe order did its job (bringing the shopper back to payment).
  useEffect(() => {
    if (initial.resume) clearPendingOrder();
  }, [initial.resume]);

  // Back from Stripe via the browser's back button restores a frozen page; un-stick it.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      request.current += 1;
      setPay((p) => (p.status === "redirecting" || p.status === "loading" ? { status: "idle" } : p));
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // Hidden by Activity (navigated away): drop in-flight quotes and transient payment states.
  useLayoutEffect(() => {
    const requests = request;
    return () => {
      requests.current += 1;
      setPay((p) => (p.status === "ready" ? p : { status: "idle" }));
    };
  }, []);

  const focusHeading = useCallback((el: HTMLHeadingElement | null) => {
    if (el && focusNextStep.current) {
      focusNextStep.current = false;
      el.focus({ preventScroll: true });
    }
  }, []);

  const fid = (name: string) => `${uid}-${name}`;
  const totals = computeTotals(lines, { promo, method, includeTax: true });
  const emailError = validateEmail(email);
  const addressErrors = validateAddress(address);
  const firstAddressError = ADDRESS_FIELDS.find((f) => addressErrors[f]);
  const key = quoteKey(lines, promo, method, email, address);
  const stale = (pay.status === "loading" || pay.status === "ready" || pay.status === "error") && pay.key !== key;
  const view: Pay["status"] = stale ? "idle" : pay.status;
  const busy = view === "loading" || view === "redirecting" || view === "placing";
  const country = countryFor(address.country);
  const chosen = shippingMethod(method);

  const touch = (field: string) => setTouched((t) => (t.has(field) ? t : new Set(t).add(field)));
  const shown = (field: string, error: string | null | undefined, group: "contact" | "shipping") =>
    (attempted[group] || touched.has(field)) && error ? error : undefined;
  const addressError = (field: AddressField) => shown(field, addressErrors[field], "shipping");
  const setField = (field: AddressField, value: string) => setAddress((a) => ({ ...a, [field]: value }));

  function goTo(next: Step) {
    const from = stepIndex(step);
    const to = stepIndex(next);
    if (from === to) return;
    setDirection(to > from ? 1 : -1);
    setStep(next);
    setReached((r) => Math.max(r, to));
    setResumed(false);
    focusNextStep.current = true;
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function remember() {
    const clean = cleanAddress(address);
    saveCheckoutDetails({ email: email.trim(), address: clean, method });
    const current = useLibrary.getState().profile;
    setProfile({ name: current?.name || `${clean.firstName} ${clean.lastName}`.trim(), email: email.trim() });
  }

  async function requestQuote() {
    const body: CheckoutRequestBody = {
      lines: lines.map(toCheckoutLine),
      email: email.trim(),
      address: cleanAddress(address),
      method,
      promo,
    };
    const forKey = key;
    const id = ++request.current;
    setPay({ status: "loading", key: forKey });

    let data: CheckoutResponse | null = null;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      data = (await res.json().catch(() => null)) as CheckoutResponse | null;
    } catch {
      data = null;
    }
    if (id !== request.current) return;

    if (!data || "error" in data) {
      setPay({
        status: "error",
        key: forKey,
        message: data?.error ?? "We couldn't reach checkout. Check your connection and try again.",
      });
      return;
    }

    if (data.mode === "stripe") {
      let url: URL | null = null;
      try {
        url = new URL(data.url);
      } catch {
        url = null;
      }
      if (!url || url.protocol !== "https:") {
        setPay({ status: "error", key: forKey, message: "The payment page didn't open. Please try again." });
        return;
      }
      savePendingOrder(
        buildOrder({ id: data.orderId, paid: "stripe", quote: data }, { lines, email, address, method, promo }),
      );
      remember();
      setPay({ status: "redirecting" });
      window.location.assign(url.href);
      return;
    }

    setPay({ status: "ready", key: forKey, quote: { totals: data.totals, unitPrices: data.unitPrices } });
  }

  function placeOrder() {
    if (pay.status !== "ready" || stale) return;
    const id = randomOrderId(new Set(useLibrary.getState().orders.map((o) => o.id)));
    const order = buildOrder({ id, paid: "demo", quote: pay.quote }, { lines, email, address, method, promo });
    setPay({ status: "placing", order });
    onPlaced();
    addOrder(order);
    remember();
    clearCart();
    router.push(`/checkout/success?order=${id}`);
  }

  function submitContact(e: FormEvent) {
    e.preventDefault();
    if (emailError) {
      setAttempted((a) => ({ ...a, contact: true }));
      document.getElementById(fid("email"))?.focus();
      return;
    }
    saveCheckoutDetails({ email: email.trim() });
    goTo("shipping");
  }

  function submitShipping(e: FormEvent) {
    e.preventDefault();
    if (firstAddressError) {
      setAttempted((a) => ({ ...a, shipping: true }));
      document.getElementById(fid(firstAddressError))?.focus();
      return;
    }
    saveCheckoutDetails({ email: email.trim(), address: cleanAddress(address), method });
    goTo("payment");
    void requestQuote();
  }

  function jumpTo(target: Step) {
    const to = stepIndex(target);
    if (to > 0 && emailError) {
      setAttempted((a) => ({ ...a, contact: true }));
      return goTo("contact");
    }
    if (to > 1 && firstAddressError) {
      setAttempted((a) => ({ ...a, shipping: true }));
      return goTo("shipping");
    }
    goTo(target);
    if (target === "payment" && view === "idle") void requestQuote();
  }

  const summaryLines = pay.status === "placing" ? pay.order.lines : lines;
  const summaryTotals = pay.status === "placing" ? pay.order.totals : totals;
  const summary = (
    <OrderSummary
      lines={summaryLines}
      totals={summaryTotals}
      promo={pay.status === "placing" ? pay.order.promo : promo}
      methodLabel={chosen.label}
      editable={!busy}
    />
  );

  const shipTo = cleanAddress(address);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_460px]">
      {/* Mobile summary */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          aria-controls={fid("summary")}
          className={cn(
            "flex w-full items-center justify-between gap-4 bg-paper px-4 py-4 text-left transition-[border-radius]",
            summaryOpen ? "rounded-t-2xl" : "rounded-2xl",
          )}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="size-4" aria-hidden />
            {summaryOpen ? "Hide" : "Show"} order summary
            <ChevronDown className={cn("size-4 transition-transform duration-300", summaryOpen && "rotate-180")} aria-hidden />
          </span>
          <span className="font-mono tabular-nums">{money(summaryTotals.total)}</span>
        </button>
        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div
              id={fid("summary")}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden rounded-b-2xl bg-paper"
            >
              <div className="border-t border-ink/10 px-4 pb-6 pt-5">{summary}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={topRef} className="min-w-0 scroll-mt-6">
        <Stepper step={step} reached={reached} disabled={busy} onSelect={jumpTo} />

        {step !== "contact" && (
          <ReviewRows
            className="mt-8"
            disabled={busy}
            rows={[
              { label: "Contact", value: email.trim(), onChange: () => goTo("contact") },
              ...(step === "payment"
                ? [
                    {
                      label: "Ship to",
                      value: (
                        <>
                          {shipTo.firstName} {shipTo.lastName}, {shipTo.address1}
                          {shipTo.address2 ? `, ${shipTo.address2}` : ""}, {shipTo.city}
                          {shipTo.region ? `, ${regionName(shipTo.country, shipTo.region)}` : ""} {shipTo.postal},{" "}
                          {countryFor(shipTo.country)?.name}
                        </>
                      ),
                      onChange: () => goTo("shipping"),
                    },
                    {
                      label: "Delivery",
                      value: `${chosen.label} · ${chosen.detail} · ${totals.shipping === 0 ? "Free" : money(totals.shipping)}`,
                      onChange: () => goTo("shipping"),
                    },
                  ]
                : []),
            ]}
          />
        )}

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.section
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-10"
            aria-labelledby={fid(`${step}-title`)}
          >
            {step === "contact" && (
              <>
                <StepHeading id={fid("contact-title")} ref={focusHeading} eyebrow="Step 1 of 3">
                  Where should we <span className="serif-italic font-normal">write?</span>
                </StepHeading>
                <p className="mt-3 max-w-lg text-smoke">Your receipt and shipping updates go here. That&apos;s all we use it for.</p>
                <form noValidate onSubmit={submitContact} className="mt-8 max-w-xl">
                  <Field id={fid("email")} label="Email" error={shown("email", emailError, "contact")}>
                    <TextInput
                      id={fid("email")}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="you@email.com"
                      value={email}
                      invalid={!!shown("email", emailError, "contact")}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => touch("email")}
                    />
                  </Field>
                  <p className="mt-4 flex items-center gap-2 text-sm text-smoke">
                    <Lock className="size-3.5 shrink-0" aria-hidden /> Remembered on this device to speed up your next order.
                  </p>
                  <Button type="submit" size="xl" className="mt-8 w-full sm:w-auto">
                    Continue to shipping <ArrowRight className="size-4" />
                  </Button>
                </form>
              </>
            )}

            {step === "shipping" && (
              <>
                <StepHeading id={fid("shipping-title")} ref={focusHeading} eyebrow="Step 2 of 3">
                  Where&apos;s it <span className="serif-italic font-normal">headed?</span>
                </StepHeading>
                <p className="mt-3 max-w-lg text-smoke">
                  Printed to order and handed to the carrier within {PRODUCTION_DAYS.shipped} business days.
                </p>
                <form noValidate onSubmit={submitShipping} className="mt-8">
                  <fieldset>
                    <legend className="sr-only">Shipping address</legend>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-6">
                      <Field id={fid("country")} label="Country" error={addressError("country")} className="col-span-2 sm:col-span-6">
                        <SelectInput
                          id={fid("country")}
                          autoComplete="shipping country"
                          value={address.country}
                          invalid={!!addressError("country")}
                          onChange={(e) => {
                            const code = e.target.value;
                            setAddress((a) => ({ ...a, country: code, region: "" }));
                          }}
                          onBlur={() => touch("country")}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </SelectInput>
                      </Field>
                      <Field id={fid("firstName")} label="First name" error={addressError("firstName")} className="col-span-1 sm:col-span-3">
                        <TextInput
                          id={fid("firstName")}
                          autoComplete="shipping given-name"
                          value={address.firstName}
                          invalid={!!addressError("firstName")}
                          onChange={(e) => setField("firstName", e.target.value)}
                          onBlur={() => touch("firstName")}
                        />
                      </Field>
                      <Field id={fid("lastName")} label="Last name" error={addressError("lastName")} className="col-span-1 sm:col-span-3">
                        <TextInput
                          id={fid("lastName")}
                          autoComplete="shipping family-name"
                          value={address.lastName}
                          invalid={!!addressError("lastName")}
                          onChange={(e) => setField("lastName", e.target.value)}
                          onBlur={() => touch("lastName")}
                        />
                      </Field>
                      <Field id={fid("address1")} label="Street address" error={addressError("address1")} className="col-span-2 sm:col-span-6">
                        <TextInput
                          id={fid("address1")}
                          autoComplete="shipping address-line1"
                          placeholder="Street and house number"
                          value={address.address1}
                          invalid={!!addressError("address1")}
                          onChange={(e) => setField("address1", e.target.value)}
                          onBlur={() => touch("address1")}
                        />
                      </Field>
                      <Field
                        id={fid("address2")}
                        label="Apartment, suite, etc."
                        optional
                        error={addressError("address2")}
                        className="col-span-2 sm:col-span-6"
                      >
                        <TextInput
                          id={fid("address2")}
                          autoComplete="shipping address-line2"
                          value={address.address2 ?? ""}
                          invalid={!!addressError("address2")}
                          onChange={(e) => setField("address2", e.target.value)}
                          onBlur={() => touch("address2")}
                        />
                      </Field>
                      <Field
                        id={fid("city")}
                        label="City"
                        error={addressError("city")}
                        className={cn("col-span-2", country?.region ? "sm:col-span-2" : "sm:col-span-4")}
                      >
                        <TextInput
                          id={fid("city")}
                          autoComplete="shipping address-level2"
                          value={address.city}
                          invalid={!!addressError("city")}
                          onChange={(e) => setField("city", e.target.value)}
                          onBlur={() => touch("city")}
                        />
                      </Field>
                      {country?.region && (
                        <Field
                          id={fid("region")}
                          label={country.region.label}
                          optional={!country.region.required}
                          error={addressError("region")}
                          className="col-span-1 sm:col-span-2"
                        >
                          {country.region.options ? (
                            <SelectInput
                              id={fid("region")}
                              autoComplete="shipping address-level1"
                              value={address.region}
                              invalid={!!addressError("region")}
                              onChange={(e) => setField("region", e.target.value)}
                              onBlur={() => touch("region")}
                            >
                              <option value="" disabled>
                                Select…
                              </option>
                              {country.region.options.map(([code, name]) => (
                                <option key={code} value={code}>
                                  {name}
                                </option>
                              ))}
                            </SelectInput>
                          ) : (
                            <TextInput
                              id={fid("region")}
                              autoComplete="shipping address-level1"
                              value={address.region}
                              invalid={!!addressError("region")}
                              onChange={(e) => setField("region", e.target.value)}
                              onBlur={() => touch("region")}
                            />
                          )}
                        </Field>
                      )}
                      <Field
                        id={fid("postal")}
                        label={country?.postal.label ?? "Postcode"}
                        optional={country ? !country.postal.required : false}
                        error={addressError("postal")}
                        className={cn(country?.region ? "col-span-1" : "col-span-2", "sm:col-span-2")}
                      >
                        <TextInput
                          id={fid("postal")}
                          autoComplete="shipping postal-code"
                          inputMode={country?.code === "US" ? "numeric" : "text"}
                          placeholder={country?.postal.placeholder}
                          value={address.postal}
                          invalid={!!addressError("postal")}
                          onChange={(e) => setField("postal", e.target.value)}
                          onBlur={() => touch("postal")}
                        />
                      </Field>
                      <Field
                        id={fid("phone")}
                        label="Phone"
                        optional
                        hint="Only if the carrier needs to reach you about delivery."
                        error={addressError("phone")}
                        className="col-span-2 sm:col-span-6"
                      >
                        <TextInput
                          id={fid("phone")}
                          type="tel"
                          autoComplete="shipping tel"
                          value={address.phone ?? ""}
                          invalid={!!addressError("phone")}
                          hasHint
                          onChange={(e) => setField("phone", e.target.value)}
                          onBlur={() => touch("phone")}
                        />
                      </Field>
                    </div>
                  </fieldset>

                  <fieldset className="mt-10">
                    <legend className="text-sm font-medium">Delivery</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {SHIPPING_METHODS.map((m) => {
                        const price = computeTotals(lines, { promo, method: m.id }).shipping;
                        const [min, max] = transitDays(m.id);
                        const shipped = addBusinessDays(initial.now, PRODUCTION_DAYS.shipped);
                        return (
                          <MethodOption
                            key={m.id}
                            name={fid("method")}
                            value={m.id}
                            label={m.label}
                            detail={m.detail}
                            price={price === 0 ? "Free" : formatPrice(price)}
                            note={`Arrives ${formatDateRange(addBusinessDays(shipped, min), addBusinessDays(shipped, max))}`}
                            hint={m.id === "standard" && price > 0 ? `Free over ${formatPrice(FREE_SHIPPING_THRESHOLD)}` : undefined}
                            checked={method === m.id}
                            onSelect={() => setMethod(m.id)}
                          />
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-10 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="button" variant="ghost" size="lg" onClick={() => goTo("contact")}>
                      <ArrowLeft className="size-4" /> Back
                    </Button>
                    <Button type="submit" size="xl">
                      Continue to payment <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === "payment" && (
              <>
                <StepHeading id={fid("payment-title")} ref={focusHeading} eyebrow="Step 3 of 3">
                  Review <span className="serif-italic font-normal">&amp; pay.</span>
                </StepHeading>
                <p className="mt-3 max-w-lg text-smoke">Check everything above, then pay. We re-check every price on our side before you&apos;re charged.</p>

                {resumed && view === "idle" && (
                  <p className="mt-6 flex items-start gap-3 rounded-2xl bg-paper px-4 py-3.5 text-sm">
                    <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      <b className="font-medium">Payment not finished?</b> Your bag and details are saved, so you can pick up right here.
                    </span>
                  </p>
                )}

                <div className="mt-8" aria-live="polite">
                  <PaymentPanel
                    view={view}
                    stale={stale}
                    total={totals.total}
                    quote={pay.status === "ready" && !stale ? pay.quote : null}
                    message={pay.status === "error" && !stale ? pay.message : null}
                    onPay={() => void requestQuote()}
                    onPlace={placeOrder}
                  />
                </div>

                <p className="mt-6 text-sm text-smoke">
                  By placing your order you agree to our{" "}
                  <Link href="/help#terms" className="text-ink underline underline-offset-4">
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/help#privacy" className="text-ink underline underline-offset-4">
                    privacy policy
                  </Link>
                  . Catalog pieces can be exchanged within 30 days.
                </p>
                <Button type="button" variant="ghost" size="lg" className="mt-6" disabled={busy} onClick={() => goTo("shipping")}>
                  <ArrowLeft className="size-4" /> Return to shipping
                </Button>
              </>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      <aside className="hidden lg:block" aria-label="Order summary">
        <div className="sticky top-24 rounded-[28px] bg-paper p-6 xl:p-8">{summary}</div>
      </aside>
    </div>
  );
}

function StepHeading({
  id,
  ref,
  eyebrow,
  children,
}: {
  id: string;
  ref: (el: HTMLHeadingElement | null) => void;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <>
      <p className="eyebrow text-smoke">{eyebrow}</p>
      <h2 id={id} ref={ref} tabIndex={-1} className="display mt-3 text-[clamp(2.2rem,4.4vw,3.6rem)] outline-none">
        {children}
      </h2>
    </>
  );
}

function Stepper({
  step,
  reached,
  disabled,
  onSelect,
}: {
  step: Step;
  reached: number;
  disabled: boolean;
  onSelect: (s: Step) => void;
}) {
  const current = stepIndex(step);
  return (
    <nav aria-label="Checkout steps">
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
        {STEPS.map((s, i) => {
          const active = i === current;
          const done = i < current;
          const reachable = i <= reached && !active && !disabled;
          return (
            <li key={s.id} className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full pl-1.5 pr-3.5 text-sm transition disabled:cursor-default",
                  reachable && "hover:bg-ink/6",
                  !reachable && !active && "opacity-50",
                  active && "font-medium",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full font-mono text-xs transition-colors duration-300",
                    active ? "bg-red text-ink" : done ? "bg-ink text-bone" : "border border-ink/20",
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                {s.label}
                {done && <span className="sr-only"> (done)</span>}
              </button>
              {i < STEPS.length - 1 && <span aria-hidden className={cn("h-px w-4 sm:w-10", i < current ? "bg-ink" : "bg-ink/20")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ReviewRows({
  rows,
  disabled,
  className,
}: {
  rows: { label: string; value: ReactNode; onChange: () => void }[];
  disabled: boolean;
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-ink/10 rounded-3xl border border-ink/12 px-5", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-start gap-4 py-4 text-sm">
          <dt className="w-16 shrink-0 text-smoke sm:w-20">{r.label}</dt>
          <dd className="min-w-0 flex-1 break-words">{r.value}</dd>
          <dd className="shrink-0">
            <button
              type="button"
              onClick={r.onChange}
              disabled={disabled}
              className="font-medium underline-offset-4 hover:underline disabled:opacity-40"
              aria-label={`Change ${r.label.toLowerCase()}`}
            >
              Change
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function MethodOption({
  name,
  value,
  label,
  detail,
  price,
  note,
  hint,
  checked,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  detail: string;
  price: string;
  note: string;
  hint?: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-4 rounded-2xl border p-4 transition-colors duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-red/25",
        checked ? "border-ink bg-ink text-bone" : "border-ink/15 bg-white/40 hover:border-ink/40",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          checked ? "border-red" : "border-ink/25",
        )}
      >
        <span className={cn("size-2 rounded-full bg-red transition-transform duration-300", checked ? "scale-100" : "scale-0")} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-medium">{label}</span>
          <span className="font-mono text-sm tabular-nums">{price}</span>
        </span>
        <span className={cn("mt-0.5 block text-sm", checked ? "text-bone/70" : "text-smoke")}>{detail}</span>
        <span className={cn("mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs", checked ? "text-bone/60" : "text-smoke")}>
          {note}
          {hint && <span className={cn("rounded-full px-2 py-0.5", checked ? "bg-bone/10 text-bone/80" : "bg-ink/6 text-ink")}>{hint}</span>}
        </span>
      </span>
    </label>
  );
}

function PaymentPanel({
  view,
  stale,
  total,
  quote,
  message,
  onPay,
  onPlace,
}: {
  view: Pay["status"];
  stale: boolean;
  total: number;
  quote: Quote | null;
  message: string | null;
  onPay: () => void;
  onPlace: () => void;
}) {
  if (view === "placing" || view === "redirecting") {
    return (
      <div className="grid place-items-center rounded-[28px] bg-ink px-6 py-14 text-center text-bone">
        <LoaderCircle className="size-8 animate-spin text-red" aria-hidden />
        <p className="display mt-5 text-3xl">{view === "placing" ? "Placing your order…" : "Opening Stripe…"}</p>
        <p className="mt-2 text-sm text-bone/60">{view === "placing" ? "Saving it to this device." : "Secure payment opens in a moment."}</p>
      </div>
    );
  }

  if (view === "ready" && quote) {
    const changed = Math.abs(quote.totals.total - total) >= 0.01;
    return (
      <div className="rounded-[28px] border-2 border-dashed border-ink/25 bg-paper p-6 md:p-8">
        <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-tape px-3 py-1.5 !text-[10px] font-medium">
          <FlaskConical className="size-3.5" aria-hidden /> Demo mode
        </span>
        <p className="display mt-5 text-[clamp(1.9rem,3.4vw,2.7rem)]">
          Demo mode — no payment <span className="serif-italic font-normal">is taken.</span>
        </p>
        <p className="mt-3 max-w-lg text-smoke">
          This shop isn&apos;t connected to Stripe yet. Placing the order saves it on this device so you can see the confirmation and
          follow it in your account. Nothing is charged and nothing ships.
        </p>
        {changed && (
          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-bone px-4 py-3 text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-deep" aria-hidden />
            <span>
              We re-checked prices against the shop: your total is <b className="font-mono">{money(quote.totals.total)}</b>.
            </span>
          </p>
        )}
        <Button variant="accent" size="xl" className="mt-7 w-full" onClick={onPlace}>
          Place order · {money(quote.totals.total)}
        </Button>
        <p className="mt-3 text-center text-xs text-smoke">
          Running this shop? Add <code className="font-mono">STRIPE_SECRET_KEY</code> to <code className="font-mono">.env.local</code>{" "}
          to take real payments.
        </p>
      </div>
    );
  }

  const loading = view === "loading";
  return (
    <div className="rounded-[28px] bg-ink p-6 text-bone md:p-8">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-bone/10">
          <ShieldCheck className="size-5 text-red" aria-hidden />
        </span>
        <div>
          <p className="text-lg font-medium">Pay securely with Stripe</p>
          <p className="mt-1 text-sm text-bone/60">
            Card, Apple Pay, Google Pay or Link. Your card details go straight to Stripe and never touch our servers.
          </p>
        </div>
      </div>
      {view === "error" && message && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-2xl bg-red/15 px-4 py-3 text-sm text-bone">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-red" aria-hidden /> {message}
        </p>
      )}
      {stale && !loading && (
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-bone/8 px-4 py-3 text-sm text-bone/80">
          <RefreshCw className="mt-0.5 size-4 shrink-0" aria-hidden /> Your order changed, so we&apos;ll re-check the total.
        </p>
      )}
      <Button variant="accent" size="xl" className="mt-6 w-full" onClick={onPay} disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden /> Checking prices…
          </>
        ) : view === "error" ? (
          <>
            <RotateCcw className="size-4" aria-hidden /> Try again
          </>
        ) : (
          <>
            Continue to payment · {money(total)}
          </>
        )}
      </Button>
    </div>
  );
}

function OrderSummary({
  lines,
  totals,
  promo,
  methodLabel,
  editable,
}: {
  lines: CartLine[];
  totals: Totals;
  promo: string | null;
  methodLabel: string;
  editable: boolean;
}) {
  const count = cartCount(lines);
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="display text-2xl">Order summary</h2>
        {editable && (
          <Link href="/cart" className="text-sm underline-offset-4 hover:underline">
            Edit bag
          </Link>
        )}
      </div>
      <p className="mt-1 font-mono text-xs text-smoke">
        {count} {count === 1 ? "piece" : "pieces"}
      </p>
      <LineList lines={lines} dense className="mt-3 max-h-[320px] overflow-y-auto border-y border-ink/10 pr-1" />
      {editable && <PromoField className="mt-6" />}
      <TotalsList totals={totals} promo={promo} shippingLabel={`Shipping · ${methodLabel}`} className="mt-6" />
      <ul className="mt-6 space-y-2.5 border-t border-ink/10 pt-5 text-sm text-smoke">
        {[
          { icon: Package, text: "Printed to order, ships in 3 business days" },
          { icon: RefreshCw, text: "Free 30-day exchanges on catalog pieces" },
          { icon: Sparkles, text: "30% of every sale goes to the artist" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5">
            <Icon className="size-4 shrink-0 text-red" aria-hidden /> {text}
          </li>
        ))}
      </ul>
    </>
  );
}

function EmptyCheckout() {
  return (
    <div>
      <EmptyState
        icon={ShoppingBag}
        title={
          <>
            Nothing to <span className="serif-italic font-normal">check out</span> yet.
          </>
        }
        body="Your bag is empty. Add a piece from the shop or design your own, then come back to pay."
      >
        <ButtonLink href="/shop" size="lg">
          Shop the drop <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="/studio" variant="outline" size="lg">
          <Sparkles className="size-4" /> Design your own
        </ButtonLink>
      </EmptyState>
      <p className="mt-6 text-center text-sm text-smoke">
        Looking for an order you placed?{" "}
        <Link href="/account?tab=orders" className="text-ink underline underline-offset-4">
          Find it in your account
        </Link>
        .
      </p>
    </div>
  );
}

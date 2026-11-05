"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Copy, House, Package, Printer, Receipt, Sparkles, Truck, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/store/cart";
import { useLibrary, type Order } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";
import { addBusinessDays, formatDateRange, formatDay, milestones, shippingMethod, type Milestone } from "./delivery";
import { countryFor, regionName } from "./schema";
import { ConfirmationSkeleton } from "./skeletons";
import { clearPendingOrder, loadPendingOrder, pendingOrderId, readPendingSnapshot, subscribeCheckoutStorage } from "./storage";
import { EmptyState, LineList, TotalsList } from "./summary-bits";

const EASE = [0.16, 1, 0.3, 1] as const;
const ICONS: Record<Milestone["id"], LucideIcon> = { printing: Printer, packed: Package, shipped: Truck, delivered: House };
/** Index of the milestone currently in progress (4 = all done). */
const STATUS_STEP: Record<Order["status"], number> = { confirmed: 0, printing: 0, shipped: 3, delivered: 4 };

/** Order ids are ours ("LS-XXXXXX"); anything else in the URL is shown as-is but trimmed. */
const cleanId = (v: string | null) => (v ? v.trim().toUpperCase().slice(0, 32) : null);

export function OrderConfirmation() {
  const params = useSearchParams();
  const orderId = cleanId(params.get("order"));
  const sessionId = params.get("session_id");
  const hydrated = useUI((s) => s.hydrated);
  const order = useLibrary((s) => (orderId ? s.orders.find((o) => o.id === orderId) : undefined));
  const pendingRaw = useSyncExternalStore(subscribeCheckoutStorage, readPendingSnapshot, () => null);

  // Back from Stripe: move the order we stashed before redirecting into the order history.
  useEffect(() => {
    if (!hydrated || !sessionId || !orderId) return;
    const pending = loadPendingOrder();
    if (!pending || pending.id !== orderId) return;
    clearPendingOrder();
    const library = useLibrary.getState();
    if (!library.orders.some((o) => o.id === pending.id)) library.addOrder(pending);
    useCart.getState().clear();
  }, [hydrated, sessionId, orderId, pendingRaw]);

  // Avoid flashing the "not on this device" state while the effect above moves the order in.
  const finalizing = !!sessionId && !order && !!orderId && pendingOrderId(pendingRaw) === orderId;

  let content;
  if (!hydrated || finalizing) content = <ConfirmationSkeleton />;
  else if (order) content = <Confirmed order={order} paid={sessionId ? "stripe" : order.paid} />;
  else if (sessionId) content = <PaymentReceived orderId={orderId} />;
  else content = <NotFound orderId={orderId} />;

  return <MotionConfig reducedMotion="user">{content}</MotionConfig>;
}

function Confirmed({ order, paid }: { order: Order; paid: Order["paid"] }) {
  const first = order.address.firstName.trim();
  const method = shippingMethod(order.method);
  const a = order.address;
  return (
    <div className="mx-auto max-w-6xl">
      <Hero
        eyebrow={paid === "stripe" ? "Payment received" : "Order confirmed"}
        title={
          <>
            Thank you{first ? `, ${first}` : ""}.
            <br />
            <span className="serif-italic font-normal">Your words are going to print.</span>
          </>
        }
        body={
          paid === "demo"
            ? "This was a demo order, so no payment was taken and nothing will ship. It's saved on this device so you can see how tracking works."
            : `Your payment went through and Stripe has emailed a receipt to ${order.email}.`
        }
      >
        <OrderNumber id={order.id} />
        {paid === "demo" ? (
          <span className="eyebrow inline-flex h-9 items-center rounded-full bg-tape px-3.5 !text-[10px] font-medium">Demo order</span>
        ) : (
          <span className="eyebrow inline-flex h-9 items-center gap-1.5 rounded-full bg-ok px-3.5 !text-[10px] font-medium text-bone">
            <Check className="size-3.5" aria-hidden /> Paid
          </span>
        )}
      </Hero>

      <div className="mt-14 grid gap-6 lg:items-start lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Section tone="dark" title="What happens next" delay={0.45}>
          <Timeline order={order} />
        </Section>

        <Section title="Your order" delay={0.55}>
          <LineList lines={order.lines} dense className="border-b border-ink/10" />
          <TotalsList totals={order.totals} promo={order.promo} shippingLabel={`Shipping · ${method.label}`} className="mt-5" />
          <div className="mt-6 grid gap-5 border-t border-ink/10 pt-5 text-sm sm:grid-cols-2">
            <div>
              <p className="eyebrow text-smoke">Ship to</p>
              <address className="mt-2 not-italic leading-relaxed">
                {a.firstName} {a.lastName}
                <br />
                {a.address1}
                {a.address2 ? `, ${a.address2}` : ""}
                <br />
                {a.city}
                {a.region ? `, ${regionName(a.country, a.region)}` : ""} {a.postal}
                <br />
                {countryFor(a.country)?.name ?? a.country}
              </address>
            </div>
            <div>
              <p className="eyebrow text-smoke">Updates to</p>
              <p className="mt-2 break-words">{order.email}</p>
              <p className="eyebrow mt-4 text-smoke">Delivery</p>
              <p className="mt-2">
                {method.label} · {method.detail}
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Actions />
    </div>
  );
}

function PaymentReceived({ orderId }: { orderId: string | null }) {
  return (
    <div className="mx-auto max-w-6xl">
      <Hero
        eyebrow="Payment received"
        title={
          <>
            Thank you.
            <br />
            <span className="serif-italic font-normal">Your words are going to print.</span>
          </>
        }
        body="Stripe confirmed your payment and emailed your receipt. This browser doesn't have the order details, so check that email for everything you ordered."
      >
        {orderId && <OrderNumber id={orderId} />}
      </Hero>
      <div className="mx-auto mt-14 max-w-2xl">
        <Section tone="dark" title="What happens next" delay={0.45}>
          <Timeline />
        </Section>
      </div>
      <Actions />
    </div>
  );
}

function NotFound({ orderId }: { orderId: string | null }) {
  return (
    <div className="mx-auto max-w-4xl">
      <EmptyState
        icon={Receipt}
        title={
          orderId ? (
            <>
              We can&apos;t find <span className="serif-italic font-normal">that order.</span>
            </>
          ) : (
            <>
              Nothing to <span className="serif-italic font-normal">confirm</span> here.
            </>
          )
        }
        body={
          orderId
            ? `There's no order ${orderId} saved in this browser. Orders are kept on the device you checked out on, so try that one, or look for the receipt in your email.`
            : "This page shows your confirmation right after checkout. Looking for something you ordered before? It's in your account."
        }
      >
        <ButtonLink href="/account?tab=orders" size="lg">
          Your orders <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline" size="lg">
          Keep shopping
        </ButtonLink>
      </EmptyState>
    </div>
  );
}

function Hero({ eyebrow, title, body, children }: { eyebrow: string; title: ReactNode; body: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Celebration />
      <motion.p
        className="eyebrow mt-10 text-smoke"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        className="display mt-4 max-w-4xl text-[clamp(2.6rem,6.4vw,5.6rem)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
      >
        {title}
      </motion.h1>
      <motion.p
        className="mt-6 max-w-xl text-lg text-smoke"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
      >
        {body}
      </motion.p>
      {children && (
        <motion.div
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {children}
        </motion.div>
      )}
    </header>
  );
}

const CONFETTI = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 2 ? 0.12 : -0.08);
  const distance = 92 + ((i * 37) % 64);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.8 + 26,
    rotate: ((i * 67) % 240) - 120,
    color: ["#FF4A1C", "#F5D547", "#0F0E0D", "#2F7D4F"][i % 4],
    shape: ["size-2.5 rounded-full", "size-2 rounded-[2px]", "h-3 w-1 rounded-full"][i % 3],
    delay: 0.08 + (i % 5) * 0.03,
  };
});

/** A record-red check that lands with a burst of confetti. */
function Celebration() {
  const reduced = useReducedMotion();
  return (
    <div className="relative grid size-28 place-items-center" aria-hidden>
      {!reduced &&
        CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", c.shape)}
            style={{ background: c.color }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{ x: c.x, y: c.y, opacity: [0, 1, 1, 0], scale: 1, rotate: c.rotate }}
            transition={{ duration: 1.5, delay: c.delay, ease: EASE, opacity: { duration: 1.5, times: [0, 0.1, 0.7, 1], delay: c.delay } }}
          />
        ))}
      <motion.span
        className="absolute inset-0 rounded-full bg-red/15"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.25, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <motion.span
        className="relative grid size-20 place-items-center rounded-full bg-red text-ink shadow-[0_18px_50px_-18px_rgba(255,74,28,.9)]"
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
      >
        <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          />
        </svg>
      </motion.span>
    </div>
  );
}

function OrderNumber({ id }: { id: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(id);
          toast.success("Order number copied", { description: id });
        } catch {
          toast(id, { description: "Your order number" });
        }
      }}
      className="group/copy inline-flex h-9 items-center gap-2 rounded-full border border-ink/15 bg-white/50 px-4 font-mono text-sm transition hover:border-ink"
      aria-label={`Order number ${id}. Copy to clipboard`}
    >
      {id}
      <Copy className="size-3.5 text-smoke transition group-hover/copy:text-ink" aria-hidden />
    </button>
  );
}

function Section({
  title,
  tone = "light",
  delay = 0,
  children,
}: {
  title: string;
  tone?: "light" | "dark";
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.section
      className={cn("rounded-[28px] p-6 md:p-8", tone === "dark" ? "grain overflow-hidden bg-ink text-bone" : "bg-paper")}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      <div className="relative z-10">
        <h2 className={cn("eyebrow", tone === "dark" ? "text-bone/55" : "text-smoke")}>{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </motion.section>
  );
}

/** Printing → Packed → Shipped → Delivered. Dates are estimates from the order time. */
function Timeline({ order }: { order?: Order }) {
  const steps = milestones(order?.method ?? "standard");
  const progress = order ? STATUS_STEP[order.status] ?? 0 : 0;
  const date = (m: Milestone) => {
    if (!order) return m.days[0] === m.days[1] ? `Day ${m.days[0]}` : `Days ${m.days[0]}–${m.days[1]}`;
    const from = addBusinessDays(order.createdAt, m.days[0]);
    return m.days[0] === m.days[1] ? formatDay(from) : formatDateRange(from, addBusinessDays(order.createdAt, m.days[1]));
  };

  return (
    <ol className="relative">
      <li className="relative flex gap-4 pb-7">
        <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-ok text-bone">
          <Check className="size-4" aria-hidden />
        </span>
        <span aria-hidden className="absolute left-5 top-10 h-full w-px -translate-x-1/2 bg-bone/15" />
        <div className="min-w-0 flex-1 pt-1">
          <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-medium">Order {order ? "confirmed" : "received"}</span>
            {order && <span className="font-mono text-sm text-bone/70">{formatDay(order.createdAt)}</span>}
          </p>
          <p className="mt-1 text-sm text-bone/55">We&apos;ve got it. Your piece joins the print queue.</p>
        </div>
      </li>
      {steps.map((m, i) => {
        const Icon = ICONS[m.id];
        const done = i < progress;
        const next = i === progress;
        const last = i === steps.length - 1;
        return (
          <li key={m.id} className={cn("relative flex gap-4", !last && "pb-7")}>
            <span
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full transition-colors",
                done ? "bg-ok text-bone" : next ? "bg-red text-ink" : "border border-bone/20 bg-ink text-bone/70",
              )}
            >
              {next && <span className="absolute inset-0 animate-ping rounded-full bg-red/40 [animation-duration:2.2s]" aria-hidden />}
              <Icon className="relative size-4" aria-hidden />
            </span>
            {!last && <span aria-hidden className="absolute left-5 top-10 h-full w-px -translate-x-1/2 bg-bone/15" />}
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-medium">
                  {m.label}
                  {next && (
                    <span className="eyebrow ml-2 rounded-full bg-bone/10 px-2 py-0.5 !text-[9px] text-bone/80">
                      {order?.status === "printing" ? "Now" : "Up next"}
                    </span>
                  )}
                </span>
                <span className="font-mono text-sm text-bone/70">
                  {order && !done && <span className="sr-only">Estimated </span>}
                  {date(m)}
                </span>
              </p>
              <p className="mt-1 text-sm text-bone/55">{m.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Actions() {
  return (
    <motion.div
      className="mt-14 flex flex-col items-center gap-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/shop" size="lg">
          Keep shopping <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="/studio" variant="outline" size="lg">
          <Sparkles className="size-4" /> Design your own
        </ButtonLink>
      </div>
      <Link href="/account?tab=orders" className="text-sm text-smoke underline-offset-4 hover:text-ink hover:underline">
        See all your orders
      </Link>
    </motion.div>
  );
}

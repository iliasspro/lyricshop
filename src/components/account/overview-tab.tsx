"use client";

import { ArrowRight, ArrowUpRight, Lock, Receipt } from "lucide-react";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Field, TextInput } from "@/components/checkout/form-fields";
import { validateEmail } from "@/components/checkout/schema";
import { Button, ButtonLink } from "@/components/ui/button";
import { useLibrary } from "@/lib/store/library";
import { LatestOrderCard } from "./orders-tab";
import { tabHref, type AccountTab } from "./tabs";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function summaryLine(orders: number, designs: number, wishlist: number, following: number) {
  const parts = [
    orders && plural(orders, "order"),
    designs && plural(designs, "saved design"),
    wishlist && `${plural(wishlist, "piece")} on your wishlist`,
    following && `${plural(following, "artist")} you follow`,
  ].filter(Boolean) as string[];
  if (parts.length === 0) return "This is your corner of the shop. Save a design, follow an artist or place an order and it shows up here.";
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
  return `${list[0].toUpperCase()}${list.slice(1)}. All of it on this device.`;
}

export function OverviewTab() {
  const profile = useLibrary((s) => s.profile);
  const orders = useLibrary((s) => s.orders);
  const designs = useLibrary((s) => s.designs.length);
  const wishlist = useLibrary((s) => s.wishlist.length);
  const following = useLibrary((s) => s.following.length);
  const first = profile?.name.trim().split(/\s+/)[0];

  const stats: { tab: AccountTab; label: string; value: number }[] = [
    { tab: "orders", label: orders.length === 1 ? "Order" : "Orders", value: orders.length },
    { tab: "designs", label: designs === 1 ? "Saved design" : "Saved designs", value: designs },
    { tab: "wishlist", label: "Wishlist", value: wishlist },
    { tab: "following", label: "Following", value: following },
  ];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
      <div className="min-w-0 space-y-6">
        <section className="grain overflow-hidden rounded-[28px] bg-ink p-6 text-bone md:p-10">
          <div className="relative z-10">
            <p className="eyebrow text-bone/50">Overview</p>
            <h2 className="display mt-4 text-[clamp(2.6rem,5.4vw,4.6rem)]">
              {first ? (
                <>
                  Hey, {first}
                  <span className="text-red">.</span>
                </>
              ) : (
                <>
                  Hey <span className="serif-italic font-normal">there.</span>
                </>
              )}
            </h2>
            <p className="mt-4 max-w-lg text-bone/65">{summaryLine(orders.length, designs, wishlist, following)}</p>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map((s) => (
                <Link
                  key={s.tab}
                  href={tabHref(s.tab)}
                  scroll={false}
                  className="group/stat rounded-2xl border border-bone/12 p-4 transition hover:border-bone/40 hover:bg-bone/5"
                >
                  <p className="display text-4xl tabular-nums">{s.value}</p>
                  <p className="mt-2 flex items-center justify-between gap-2 text-sm text-bone/60">
                    {s.label}
                    <ArrowUpRight className="size-3.5 shrink-0 opacity-0 transition group-hover/stat:opacity-100" aria-hidden />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {orders[0] ? (
          <LatestOrderCard order={orders[0]} />
        ) : (
          <section className="flex flex-wrap items-center justify-between gap-5 rounded-[28px] border border-dashed border-ink/20 p-6 md:p-7">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-paper">
                <Receipt className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-medium">No orders yet</p>
                <p className="text-sm text-smoke">Your first one shows up here with a delivery estimate.</p>
              </div>
            </div>
            <ButtonLink href="/shop">
              Start shopping <ArrowRight className="size-4" />
            </ButtonLink>
          </section>
        )}
      </div>

      {/* Keyed on the saved profile so a change made elsewhere (like checkout) refreshes the form. */}
      <ProfileCard key={profile ? `${profile.name}\n${profile.email}` : "none"} />
    </div>
  );
}

function ProfileCard() {
  const profile = useLibrary((s) => s.profile);
  const setProfile = useLibrary((s) => s.setProfile);
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [showError, setShowError] = useState(false);
  const id = useId();
  const emailError = email.trim() ? validateEmail(email) : null;
  const dirty = name.trim() !== (profile?.name ?? "") || email.trim() !== (profile?.email ?? "");

  function save(e: FormEvent) {
    e.preventDefault();
    if (emailError) {
      setShowError(true);
      document.getElementById(`${id}-email`)?.focus();
      return;
    }
    const next = { name: name.trim(), email: email.trim() };
    setProfile(next.name || next.email ? next : null);
    toast.success("Saved on this device", { description: "We'll use these to fill in checkout." });
  }

  function forget() {
    const previous = profile;
    setProfile(null);
    toast("Details forgotten", {
      description: "Removed from this device.",
      action: previous ? { label: "Undo", onClick: () => setProfile(previous) } : undefined,
    });
  }

  return (
    <section className="h-fit rounded-[28px] bg-paper p-6 md:p-8" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="display text-3xl">
        Your details
      </h2>
      <p className="mt-2 text-sm text-smoke">Used to fill in checkout, nothing else.</p>
      <form noValidate onSubmit={save} className="mt-6 space-y-5">
        <Field id={`${id}-name`} label="Name">
          <TextInput
            id={`${id}-name`}
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field id={`${id}-email`} label="Email" error={showError ? emailError : undefined}>
          <TextInput
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@email.com"
            value={email}
            invalid={showError && !!emailError}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setShowError(true)}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" disabled={!dirty}>
            Save details
          </Button>
          {profile && (
            <Button type="button" variant="ghost" onClick={forget}>
              Forget me
            </Button>
          )}
        </div>
      </form>
      <p className="mt-6 flex gap-3 rounded-2xl bg-bone/70 p-4 text-sm text-smoke">
        <Lock className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
        <span>
          <b className="font-medium text-ink">Stored on this device only.</b> Lyricshop doesn&apos;t have accounts or passwords yet, so
          clearing your browser data clears this page too.
        </span>
      </p>
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ShoppingBag, Sparkles, Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ButtonLink } from "@/components/ui/button";
import { colorFor } from "@/lib/colors";
import { PRODUCTS } from "@/lib/data/products";
import { computeTotals, formatPrice } from "@/lib/pricing";
import { cartCount, useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { CartLineItem } from "./cart-line";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const lines = useCart((s) => s.lines);
  const promo = useCart((s) => s.promo);
  const add = useCart((s) => s.add);
  const totals = computeTotals(lines, { promo });
  const count = cartCount(lines);
  const progress = Math.min(1, (totals.subtotal - totals.discount) / 100);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const inCart = new Set(lines.map((l) => l.slug));
  const suggestions = PRODUCTS.filter((p) => !inCart.has(p.slug) && (p.garment === "tote" || p.garment === "cap")).slice(0, 2);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Your bag">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-bone shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <h2 className="display text-3xl">
                Your bag <span className="font-mono text-base font-normal tracking-normal text-smoke">({count})</span>
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-full transition hover:bg-ink/6"
                aria-label="Close bag"
              >
                <X className="size-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="grid size-20 place-items-center rounded-full bg-paper">
                  <ShoppingBag className="size-8" />
                </div>
                <p className="display mt-6 text-3xl">Quiet in here.</p>
                <p className="mt-2 max-w-xs text-smoke">Your bag is empty. Find a line that sounds like you, or write your own.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/shop" onClick={() => setOpen(false)}>
                    Shop the drop
                  </ButtonLink>
                  <ButtonLink href="/studio" variant="outline" onClick={() => setOpen(false)}>
                    <Sparkles className="size-4" /> Design your own
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-6 rounded-2xl bg-paper p-4">
                  <p className="flex items-center gap-2 text-sm">
                    <Truck className="size-4" />
                    {totals.freeShippingRemaining > 0 ? (
                      <span>
                        You&apos;re <b className="font-mono">{formatPrice(totals.freeShippingRemaining)}</b> away from free shipping
                      </span>
                    ) : (
                      <span>You&apos;ve unlocked free shipping 🎉</span>
                    )}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <motion.div
                      className="h-full rounded-full bg-red"
                      initial={false}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                <div className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
                  {lines.map((line) => (
                    <CartLineItem key={line.key} line={line} compact />
                  ))}

                  {suggestions.length > 0 && (
                    <div className="py-6">
                      <p className="eyebrow mb-4 text-smoke">Complete the look</p>
                      <div className="grid grid-cols-2 gap-3">
                        {suggestions.map((p) => {
                          const c = colorFor(p.colors[0]);
                          return (
                            <div key={p.slug} className="rounded-2xl bg-paper p-3">
                              <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="block aspect-square">
                                <GarmentMockup garment={p.garment} color={c.hex} layers={p.design.front} shadow={false} className="h-full w-full" />
                              </Link>
                              <p className="mt-2 truncate text-sm font-medium">{p.title}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="font-mono text-xs">{formatPrice(p.price)}</span>
                                <button
                                  type="button"
                                  className="rounded-full bg-ink px-3 py-1 text-xs text-bone transition hover:bg-ink-3"
                                  onClick={() =>
                                    add({
                                      kind: "product",
                                      slug: p.slug,
                                      title: p.title,
                                      creator: p.creator,
                                      garment: p.garment,
                                      color: p.colors[0],
                                      size: "One size",
                                      unitPrice: p.price,
                                      design: p.design,
                                    })
                                  }
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-ink/10 px-6 pb-6 pt-5">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-smoke">Subtotal</dt>
                      <dd className="font-mono tabular-nums">{formatPrice(totals.subtotal, { cents: true })}</dd>
                    </div>
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-ok">
                        <dt>Promo {promo}</dt>
                        <dd className="font-mono tabular-nums">−{formatPrice(totals.discount, { cents: true })}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-smoke">Shipping</dt>
                      <dd className="font-mono tabular-nums">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
                    </div>
                  </dl>
                  <ButtonLink href="/checkout" size="lg" className="mt-5 w-full" onClick={() => setOpen(false)}>
                    Checkout · {formatPrice(totals.total, { cents: true })} <ArrowRight className="size-4" />
                  </ButtonLink>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="mt-3 block text-center text-sm text-smoke underline-offset-4 hover:text-ink hover:underline"
                  >
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

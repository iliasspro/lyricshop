"use client";

import { ArrowLeft, ArrowRight, Lock, Package, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { CartLineItem } from "@/components/cart/cart-line";
import { BagSkeleton } from "@/components/checkout/skeletons";
import { EmptyState, FreeShippingMeter, TotalsList } from "@/components/checkout/summary-bits";
import { PromoField } from "@/components/checkout/promo-field";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { PRODUCTS, PRODUCT_BY_SLUG, relatedProducts, type Product } from "@/lib/data/products";
import { computeTotals, formatPrice } from "@/lib/pricing";
import { cartCount, useCart, type CartLine } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";

/** Related pieces for what's in the bag, topped up with bestsellers. Deterministic for a given bag. */
function suggestionsFor(lines: CartLine[], count = 4): Product[] {
  const inBag = new Set(lines.flatMap((l) => (l.slug ? [l.slug] : [])));
  const score = new Map<string, number>();
  for (const line of lines) {
    if (line.kind !== "product" || !line.slug || !Object.hasOwn(PRODUCT_BY_SLUG, line.slug)) continue;
    relatedProducts(PRODUCT_BY_SLUG[line.slug], 8).forEach((p, i) => score.set(p.slug, (score.get(p.slug) ?? 0) + 8 - i));
  }
  const related = [...score.entries()].sort((a, b) => b[1] - a[1]).map(([slug]) => PRODUCT_BY_SLUG[slug]);
  const bestsellers = [...PRODUCTS].sort((a, b) => b.sold - a.sold);
  const seen = new Set<string>();
  return [...related, ...bestsellers].filter((p) => !inBag.has(p.slug) && !seen.has(p.slug) && seen.add(p.slug)).slice(0, count);
}

export function CartView() {
  const hydrated = useUI((s) => s.hydrated);
  const lines = useCart((s) => s.lines);
  // Before hydration the store is empty on both server and client, so this renders bestsellers either way.
  const suggestions = suggestionsFor(lines);

  return (
    <>
      {!hydrated ? <BagSkeleton /> : lines.length === 0 ? <EmptyBag /> : <FilledBag lines={lines} />}

      <section className="mt-24 md:mt-32" aria-labelledby="bag-suggestions">
        <SectionHeading
          eyebrow="You might also like"
          title={
            <span id="bag-suggestions">
              Pairs <span className="serif-italic font-normal">well</span> with
            </span>
          }
          aside={
            <Link href="/shop" className="group/all inline-flex items-center gap-2 font-medium">
              Shop everything <ArrowRight className="size-4 transition group-hover/all:translate-x-1" />
            </Link>
          }
          className="mb-10"
        />
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {suggestions.map((p) => (
            <ProductCard key={p.slug} product={p} className="w-[68vw] shrink-0 snap-start sm:w-[40vw] md:w-auto" />
          ))}
        </div>
      </section>
    </>
  );
}

function EmptyBag() {
  return (
    <EmptyState
      icon={ShoppingBag}
      className="mt-10"
      title={
        <>
          Quiet <span className="serif-italic font-normal">in here.</span>
        </>
      }
      body="Your bag is empty. Find a line that sounds like you, or write your own in the Studio and we'll print it in three days."
    >
      <ButtonLink href="/shop" size="lg">
        Shop the drop <ArrowRight className="size-4" />
      </ButtonLink>
      <ButtonLink href="/studio" variant="outline" size="lg">
        <Sparkles className="size-4" /> Design your own
      </ButtonLink>
    </EmptyState>
  );
}

function FilledBag({ lines }: { lines: CartLine[] }) {
  const promo = useCart((s) => s.promo);
  const totals = computeTotals(lines, { promo });
  const count = cartCount(lines);

  return (
    <div className="mt-10 grid gap-10 pb-20 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14 lg:pb-0">
      <div className="min-w-0">
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <p className="font-mono text-sm text-smoke">
            {count} {count === 1 ? "piece" : "pieces"}
          </p>
        </div>
        <FreeShippingMeter totals={totals} promo={promo} />
        <ul className="divide-y divide-ink/10 border-b border-ink/10">
          {lines.map((line) => (
            <li key={line.key}>
              <CartLineItem line={line} />
            </li>
          ))}
        </ul>
        <Link href="/shop" className="group/back mt-6 inline-flex items-center gap-2 text-[15px] font-medium">
          <ArrowLeft className="size-4 transition group-hover/back:-translate-x-1" /> Keep shopping
        </Link>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Order summary">
        <div className="rounded-[28px] bg-paper p-6 md:p-8">
          <h2 className="display text-3xl">Summary</h2>
          <PromoField className="mt-6" />
          <TotalsList totals={totals} promo={promo} shippingLabel="Standard shipping" tax="later" className="mt-6 border-t border-ink/10 pt-6" />
          <ButtonLink href="/checkout" variant="accent" size="xl" className="mt-7 w-full">
            Checkout <ArrowRight className="size-4" />
          </ButtonLink>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-smoke">
            <Lock className="size-3.5" aria-hidden /> Secure payment with Stripe
          </p>
        </div>
        <ul className="mt-5 grid gap-3 px-2 text-sm">
          {[
            { icon: Package, text: "Printed to order, shipped in 3 business days" },
            { icon: RefreshCw, text: "Free 30-day exchanges on catalog pieces" },
            { icon: Sparkles, text: "Artists keep 30% of every sale" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <Icon className="size-4 shrink-0 text-red" aria-hidden /> {text}
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-ink/10 bg-bone/90 p-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0 flex-1 pl-1">
          <p className="text-xs text-smoke">Estimated total</p>
          <p className="font-mono text-lg tabular-nums">{formatPrice(totals.total, { cents: true })}</p>
        </div>
        <ButtonLink href="/checkout" variant="accent">
          Checkout <ArrowRight className="size-4" />
        </ButtonLink>
      </div>
    </div>
  );
}

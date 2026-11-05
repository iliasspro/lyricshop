"use client";

import { ArrowRight, Receipt, Sparkles } from "lucide-react";
import Link from "next/link";
import { deliveryWindow, formatDate, formatDateRange, shippingMethod } from "@/components/checkout/delivery";
import { countryFor, regionName } from "@/components/checkout/schema";
import { EmptyState, LineList, LineThumb, StatusPill, TotalsList } from "@/components/checkout/summary-bits";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { cartCount } from "@/lib/store/cart";
import { useLibrary, type Order } from "@/lib/store/library";
import { tabHref } from "./tabs";

export function OrdersTab() {
  const orders = useLibrary((s) => s.orders);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        className="mt-10"
        title={
          <>
            No orders <span className="serif-italic font-normal">yet.</span>
          </>
        }
        body="When you check out, your orders land here with their status and delivery estimate."
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

  return (
    <div className="mt-10 space-y-5">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderMeta({ order }: { order: Order }) {
  const count = cartCount(order.lines);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="font-mono text-[15px] font-medium">{order.id}</p>
        <p className="text-sm text-smoke">
          Placed {formatDate(order.createdAt)} · {count} {count === 1 ? "piece" : "pieces"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {order.paid === "demo" && (
          <span className="eyebrow inline-flex h-6 items-center rounded-full bg-tape px-2.5 !text-[10px] font-medium">Demo</span>
        )}
        <StatusPill status={order.status} />
      </div>
    </div>
  );
}

function Arrival({ order, className }: { order: Order; className?: string }) {
  const [from, to] = deliveryWindow(order.createdAt, order.method);
  const delivered = order.status === "delivered";
  return (
    <div className={className}>
      <p className="eyebrow text-smoke">{delivered ? "Delivered" : "Estimated arrival"}</p>
      <p className="mt-1.5 font-medium">{delivered ? "Enjoy it" : formatDateRange(from, to)}</p>
      <p className="mt-0.5 text-sm text-smoke">
        {shippingMethod(order.method).label} to {order.address.city}
      </p>
    </div>
  );
}

export function OrderCard({ order }: { order: Order }) {
  const a = order.address;
  return (
    <article className="overflow-hidden rounded-[28px] border border-ink/10 bg-white/35">
      <header className="border-b border-ink/10 px-5 py-4 md:px-7">
        <OrderMeta order={order} />
      </header>
      <div className="grid gap-6 px-5 py-5 md:grid-cols-[minmax(0,1fr)_300px] md:gap-10 md:px-7 md:py-6">
        <LineList lines={order.lines} dense />
        <div className="space-y-6 md:border-l md:border-ink/10 md:pl-8">
          <Arrival order={order} />
          <details className="group/details">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span>
                Total <span className="font-mono tabular-nums">{formatPrice(order.totals.total, { cents: true })}</span>
              </span>
              <span className="text-smoke underline-offset-4 group-hover/details:underline">
                <span className="group-open/details:hidden">Details</span>
                <span className="hidden group-open/details:inline">Hide</span>
              </span>
            </summary>
            <TotalsList totals={order.totals} promo={order.promo} className="mt-4 text-sm" />
            <p className="mt-5 text-sm leading-relaxed text-smoke">
              <span className="eyebrow mb-1 block">Ship to</span>
              {a.firstName} {a.lastName}, {a.address1}
              {a.address2 ? `, ${a.address2}` : ""}, {a.city}
              {a.region ? `, ${regionName(a.country, a.region)}` : ""} {a.postal}, {countryFor(a.country)?.name ?? a.country}
            </p>
          </details>
        </div>
      </div>
    </article>
  );
}

/** Compact card for the overview tab. */
export function LatestOrderCard({ order, className }: { order: Order; className?: string }) {
  return (
    <section className={cn("rounded-[28px] border border-ink/10 bg-white/35 p-5 md:p-7", className)} aria-label="Latest order">
      <p className="eyebrow mb-4 text-smoke">Latest order</p>
      <OrderMeta order={order} />
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div className="flex -space-x-3">
          {order.lines.slice(0, 4).map((line) => (
            <LineThumb key={line.key} line={line} badge={line.qty} className="size-16 ring-4 ring-bone" />
          ))}
          {order.lines.length > 4 && (
            <span className="grid size-16 place-items-center rounded-2xl bg-paper font-mono text-sm ring-4 ring-bone">
              +{order.lines.length - 4}
            </span>
          )}
        </div>
        <Arrival order={order} className="min-w-40" />
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-ink/10 pt-5">
        <p className="font-mono text-lg tabular-nums">{formatPrice(order.totals.total, { cents: true })}</p>
        <Link href={tabHref("orders")} scroll={false} className="group/all inline-flex items-center gap-2 text-sm font-medium">
          All orders <ArrowRight className="size-4 transition group-hover/all:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

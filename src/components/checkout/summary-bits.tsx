"use client";

import { motion } from "motion/react";
import { Sparkles, Tag, Truck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { hasPrint } from "@/lib/design";
import { GARMENTS } from "@/lib/garments";
import { FREE_SHIPPING_THRESHOLD, TAX_RATE, findPromo, formatPrice, type Totals } from "@/lib/pricing";
import type { CartLine } from "@/lib/store/cart";
import type { Order } from "@/lib/store/library";

const money = (n: number) => formatPrice(n, { cents: true });

/** Which side of the garment to show: the front, unless only the back is printed. */
function thumbView(line: Pick<CartLine, "garment" | "design">) {
  return !hasPrint(line.design, "front") && hasPrint(line.design, "back") && GARMENTS[line.garment].views.back ? "back" : "front";
}

export function LineThumb({
  line,
  badge,
  className,
}: {
  line: Pick<CartLine, "garment" | "color" | "design" | "title" | "kind">;
  badge?: number;
  className?: string;
}) {
  const color = colorFor(line.color);
  const view = thumbView(line);
  return (
    <span className={cn("relative block shrink-0 rounded-2xl bg-[#e5ddcf] p-1", className)}>
      <GarmentMockup
        garment={line.garment}
        color={color.hex}
        view={view}
        layers={line.design[view]}
        shadow={false}
        className="h-full w-full"
        title={`${line.title} in ${color.name}`}
      />
      {line.kind === "custom" && (
        <span className="absolute left-1 top-1 grid size-4 place-items-center rounded-full bg-red text-ink" aria-hidden>
          <Sparkles className="size-2.5" />
        </span>
      )}
      {badge !== undefined && badge > 1 && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 font-mono text-[10px] text-bone">
          {badge}
        </span>
      )}
    </span>
  );
}

/** Read-only list of bag or order lines. */
export function LineList({ lines, className, dense = false }: { lines: CartLine[]; className?: string; dense?: boolean }) {
  return (
    <ul className={cn("divide-y divide-ink/10", className)}>
      {lines.map((line) => {
        const color = colorFor(line.color);
        const creator = line.creator ? CREATOR_BY_HANDLE[line.creator] : null;
        const back = line.kind === "custom" && hasPrint(line.design, "back");
        return (
          <li key={line.key} className={cn("flex items-center gap-4", dense ? "py-3" : "py-4")}>
            <LineThumb line={line} badge={line.qty} className={dense ? "size-14" : "size-[72px]"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium leading-snug">{line.title}</p>
              <p className="mt-0.5 truncate text-sm text-smoke">
                {line.kind === "custom" ? (back ? "Your design · front + back" : "Your design") : creator ? `by ${creator.name}` : ""}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-xs text-smoke">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full border border-ink/15" style={{ background: color.hex }} />
                  {color.name}
                </span>
                <span>{line.size === "One size" ? "One size" : `Size ${line.size}`}</span>
                {line.qty > 1 && <span>×{line.qty}</span>}
              </p>
            </div>
            <p className="shrink-0 self-start font-mono text-sm tabular-nums">{money(line.unitPrice * line.qty)}</p>
          </li>
        );
      })}
    </ul>
  );
}

function Row({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <dt className="flex items-center gap-1.5 text-smoke">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}

export function TotalsList({
  totals,
  promo,
  shippingLabel = "Shipping",
  tax = "included",
  className,
}: {
  totals: Totals;
  promo?: string | null;
  shippingLabel?: ReactNode;
  /** "later" shows tax as calculated at checkout (the bag page). */
  tax?: "included" | "later";
  className?: string;
}) {
  return (
    <dl className={cn("space-y-2.5 text-[15px]", className)}>
      <Row label="Subtotal" value={money(totals.subtotal)} />
      {totals.discount > 0 && (
        <Row
          className="[&_dt]:text-ok [&_dd]:text-ok"
          label={
            <>
              <Tag className="size-3.5" aria-hidden /> {promo ? `Promo ${promo}` : "Discount"}
            </>
          }
          value={`−${money(totals.discount)}`}
        />
      )}
      <Row label={shippingLabel} value={totals.subtotal === 0 ? "—" : totals.shipping === 0 ? "Free" : money(totals.shipping)} />
      {tax === "included" ? (
        <Row label={`Tax (${Math.round(TAX_RATE * 100)}%)`} value={money(totals.tax)} />
      ) : (
        <Row label="Tax" value={<span className="font-sans text-sm text-smoke">Calculated at checkout</span>} />
      )}
      <div className="flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
        <dt className="font-medium">{tax === "included" ? "Total" : "Estimated total"}</dt>
        <dd className="flex items-baseline gap-2">
          <span className="font-mono text-xs text-smoke">USD</span>
          <span className="font-mono text-2xl font-medium tabular-nums tracking-tight">{money(totals.total)}</span>
        </dd>
      </div>
    </dl>
  );
}

export function FreeShippingMeter({ totals, promo, className }: { totals: Totals; promo?: string | null; className?: string }) {
  const free = totals.freeShippingRemaining === 0 || !!findPromo(promo)?.freeShipping;
  const progress = free ? 1 : Math.min(1, Math.max(0, (totals.subtotal - totals.discount) / FREE_SHIPPING_THRESHOLD));
  return (
    <div className={cn("rounded-2xl bg-paper p-4", className)}>
      <p className="flex items-center gap-2 text-sm" aria-live="polite">
        <Truck className="size-4 shrink-0" aria-hidden />
        {free ? (
          <span>
            Free standard shipping <b className="font-medium text-ok">unlocked</b>
          </span>
        ) : (
          <span>
            You&apos;re <b className="font-mono font-medium">{formatPrice(totals.freeShippingRemaining)}</b> away from free shipping
          </span>
        )}
      </p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <motion.div
          className={cn("h-full rounded-full", free ? "bg-ok" : "bg-red")}
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

const STATUS: Record<Order["status"], { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-ink text-bone" },
  printing: { label: "Printing", className: "bg-tape text-ink" },
  shipped: { label: "Shipped", className: "bg-red text-ink" },
  delivered: { label: "Delivered", className: "bg-ok text-bone" },
};

export function StatusPill({ status, className }: { status: Order["status"]; className?: string }) {
  const s = STATUS[status] ?? STATUS.confirmed;
  return (
    <span className={cn("eyebrow inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 !text-[10px] font-medium", s.className, className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {s.label}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  children,
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-[32px] bg-paper px-6 py-16 text-center md:py-24", className)}>
      <div className="grid size-20 place-items-center rounded-full bg-bone shadow-[0_10px_30px_-18px_rgba(15,14,13,.5)]">
        <Icon className="size-8" aria-hidden />
      </div>
      <h2 className="display mt-7 max-w-xl text-[clamp(2.2rem,4.6vw,3.6rem)]">{title}</h2>
      <p className="mt-3 max-w-md text-smoke">{body}</p>
      {children && <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">{children}</div>}
    </div>
  );
}

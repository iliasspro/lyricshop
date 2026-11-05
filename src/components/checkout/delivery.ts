// Delivery estimates. Every piece is printed to order: printing starts within a
// business day, it's packed the next day and handed to the carrier on day three.
// Transit times come from SHIPPING_METHODS ("4–7 business days") so they can't drift.

import { SHIPPING_METHODS, type ShippingMethodId } from "@/lib/pricing";

export const PRODUCTION_DAYS = { printing: 1, packed: 2, shipped: 3 } as const;

export function shippingMethod(id: ShippingMethodId) {
  return SHIPPING_METHODS.find((m) => m.id === id) ?? SHIPPING_METHODS[0];
}

/** Transit window in business days, parsed from the method's label. */
export function transitDays(id: ShippingMethodId): [min: number, max: number] {
  const match = shippingMethod(id).detail.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (match) return [Number(match[1]), Number(match[2])];
  return id === "express" ? [1, 3] : [4, 7];
}

export function addBusinessDays(from: number | Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return d;
}

export type Milestone = {
  id: "printing" | "packed" | "shipped" | "delivered";
  label: string;
  detail: string;
  /** Business days after the order, as [earliest, latest]. */
  days: [number, number];
};

export function milestones(method: ShippingMethodId): Milestone[] {
  const [min, max] = transitDays(method);
  const m = shippingMethod(method);
  const ship = PRODUCTION_DAYS.shipped;
  return [
    { id: "printing", label: "Printing", detail: "Pulled, printed and cured by hand, just for you", days: [PRODUCTION_DAYS.printing, PRODUCTION_DAYS.printing] },
    { id: "packed", label: "Packed", detail: "Folded into plastic-free packaging", days: [PRODUCTION_DAYS.packed, PRODUCTION_DAYS.packed] },
    { id: "shipped", label: "Shipped", detail: `${m.label} shipping, with a tracking link by email`, days: [ship, ship] },
    { id: "delivered", label: "Delivered", detail: "Time to wear your words", days: [ship + min, ship + max] },
  ];
}

/** Earliest and latest delivery dates for an order placed at `createdAt`. */
export function deliveryWindow(createdAt: number, method: ShippingMethodId): [Date, Date] {
  const [min, max] = milestones(method).find((m) => m.id === "delivered")!.days;
  return [addBusinessDays(createdAt, min), addBusinessDays(createdAt, max)];
}

const DAY = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const SHORT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const LONG = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "Mon, Oct 20" */
export const formatDay = (d: Date | number) => DAY.format(d);
/** "Oct 18, 2026" */
export const formatDate = (d: Date | number) => LONG.format(d);
/** "Oct 27 – 30" or "Oct 30 – Nov 4" */
export function formatDateRange(from: Date, to: Date): string {
  if (from.getTime() === to.getTime()) return SHORT.format(from);
  return SHORT.formatRange(from, to);
}

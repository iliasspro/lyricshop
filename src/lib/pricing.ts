export const FREE_SHIPPING_THRESHOLD = 100;

export const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", detail: "4–7 business days", price: 6 },
  { id: "express", label: "Express", detail: "1–3 business days", price: 15 },
] as const;

export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];

type Promo = { code: string; label: string; percent?: number; freeShipping?: boolean };

export const PROMOS: Record<string, Promo> = {
  LYRIC10: { code: "LYRIC10", label: "10% off your order", percent: 10 },
  FIRSTVERSE: { code: "FIRSTVERSE", label: "15% off your first order", percent: 15 },
  FREESHIP: { code: "FREESHIP", label: "Free shipping", freeShipping: true },
};

export function findPromo(code: string | null | undefined): Promo | null {
  if (!code) return null;
  return PROMOS[code.trim().toUpperCase()] ?? null;
}

export const TAX_RATE = 0.08;

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingRemaining: number;
};

export function computeTotals(
  lines: { unitPrice: number; qty: number }[],
  opts: { promo?: string | null; method?: ShippingMethodId; includeTax?: boolean } = {},
): Totals {
  const subtotal = round(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0));
  const promo = findPromo(opts.promo);
  const discount = round(promo?.percent ? (subtotal * promo.percent) / 100 : 0);
  const afterDiscount = subtotal - discount;
  const method = SHIPPING_METHODS.find((m) => m.id === (opts.method ?? "standard"))!;
  const qualifiesFree = afterDiscount >= FREE_SHIPPING_THRESHOLD || !!promo?.freeShipping;
  const shipping = subtotal === 0 ? 0 : method.id === "standard" && qualifiesFree ? 0 : method.price;
  const tax = opts.includeTax ? round(afterDiscount * TAX_RATE) : 0;
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: round(afterDiscount + shipping + tax),
    freeShippingRemaining: Math.max(0, round(FREE_SHIPPING_THRESHOLD - afterDiscount)),
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

export function formatPrice(n: number, opts: { cents?: boolean } = {}): string {
  const cents = opts.cents ?? !Number.isInteger(n);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);
}

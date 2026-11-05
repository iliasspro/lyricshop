import "server-only";

import Stripe from "stripe";
import { transitDays, shippingMethod } from "@/components/checkout/delivery";
import type { CheckoutRequestBody, PricedLine } from "@/components/checkout/schema";
import { TAX_RATE, findPromo, type Totals } from "@/lib/pricing";

// Stripe Checkout mirrors computeTotals():
// - every line is a price_data item priced by the server, in USD cents
// - percentage promos are a reusable coupon (one per code + percent)
// - tax is one reusable flat tax rate applied to every line (shipping is untaxed)
// - the shipping option is the method chosen in our checkout, already free when it qualifies
// Stripe rounds tax per line, so its total can differ from ours by a cent or two.

const clients = new Map<string, Stripe>();
const coupons = new Map<string, string>();
const taxRates = new Map<string, string>();

function stripeFor(secretKey: string): Stripe {
  let client = clients.get(secretKey);
  if (!client) {
    client = new Stripe(secretKey, { maxNetworkRetries: 2, timeout: 20_000, appInfo: { name: "Lyricshop" } });
    clients.set(secretKey, client);
  }
  return client;
}

const toCents = (n: number) => Math.round(n * 100);

const isStripeError = (err: unknown, code: string) => err instanceof Stripe.errors.StripeError && err.code === code;

async function ensureCoupon(stripe: Stripe, secretKey: string, code: string, percent: number, label: string): Promise<string> {
  const id = `lyricshop-${code.toLowerCase()}-${percent}`;
  const cacheKey = `${secretKey}:${id}`;
  const cached = coupons.get(cacheKey);
  if (cached) return cached;
  try {
    const existing = await stripe.coupons.retrieve(id);
    if (!existing.valid) throw new Error(`Stripe coupon ${id} exists but is no longer valid`);
  } catch (err) {
    if (!isStripeError(err, "resource_missing")) throw err;
    try {
      await stripe.coupons.create({ id, percent_off: percent, duration: "once", name: `${code} · ${label}`.slice(0, 40) });
    } catch (createErr) {
      // Another request created it first.
      if (!isStripeError(createErr, "resource_already_exists")) throw createErr;
    }
  }
  coupons.set(cacheKey, id);
  return id;
}

async function ensureTaxRate(stripe: Stripe, secretKey: string): Promise<string> {
  const percentage = Math.round(TAX_RATE * 10_000) / 100;
  const tag = `flat-${percentage}`;
  const cacheKey = `${secretKey}:${tag}`;
  const cached = taxRates.get(cacheKey);
  if (cached) return cached;
  const page = await stripe.taxRates.list({ active: true, inclusive: false, limit: 100 });
  const found = page.data.find((r) => r.metadata?.lyricshop === tag && r.percentage === percentage);
  const id =
    found?.id ??
    (
      await stripe.taxRates.create({
        display_name: "Sales tax",
        description: "Lyricshop flat sales tax",
        percentage,
        inclusive: false,
        metadata: { lyricshop: tag },
      })
    ).id;
  taxRates.set(cacheKey, id);
  return id;
}

export async function createStripeCheckout(opts: {
  secretKey: string;
  origin: string;
  orderId: string;
  checkout: CheckoutRequestBody;
  lines: PricedLine[];
  totals: Totals;
}): Promise<string> {
  const { secretKey, origin, orderId, checkout, lines, totals } = opts;
  const stripe = stripeFor(secretKey);
  const promo = findPromo(checkout.promo);
  const [taxRate, coupon] = await Promise.all([
    ensureTaxRate(stripe, secretKey),
    promo?.percent ? ensureCoupon(stripe, secretKey, promo.code, promo.percent, promo.label) : Promise.resolve(null),
  ]);

  const method = shippingMethod(checkout.method);
  const [minDays, maxDays] = transitDays(checkout.method);
  const a = checkout.address;
  // Stripe can only show product photos it can fetch, so skip them on localhost.
  const publicImages = origin.startsWith("https://");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: orderId,
    customer_email: checkout.email,
    submit_type: "pay",
    line_items: lines.map((l) => ({
      quantity: l.qty,
      tax_rates: [taxRate],
      price_data: {
        currency: "usd",
        unit_amount: toCents(l.unitPrice),
        product_data: {
          name: l.name,
          description: l.description,
          images: publicImages && l.image ? [`${origin}${l.image}`] : undefined,
          metadata: {
            kind: l.kind,
            garment: l.garment,
            color: l.color,
            size: l.size,
            ...(l.slug ? { slug: l.slug } : {}),
            ...(l.designId ? { design_id: l.designId } : {}),
          },
        },
      },
    })),
    discounts: coupon ? [{ coupon }] : undefined,
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: totals.shipping === 0 ? `${method.label} shipping (free)` : `${method.label} shipping`,
          fixed_amount: { amount: toCents(totals.shipping), currency: "usd" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: minDays },
            maximum: { unit: "business_day", value: maxDays },
          },
        },
      },
    ],
    payment_intent_data: {
      metadata: { order_id: orderId },
      shipping: {
        name: `${a.firstName} ${a.lastName}`.trim(),
        phone: a.phone || undefined,
        address: {
          line1: a.address1,
          line2: a.address2 || undefined,
          city: a.city,
          state: a.region || undefined,
          postal_code: a.postal,
          country: a.country,
        },
      },
    },
    metadata: { order_id: orderId, shipping_method: method.id, promo: promo?.code ?? "" },
    success_url: `${origin}/checkout/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  });

  if (!session.url) throw new Error("Stripe did not return a Checkout URL");
  return session.url;
}

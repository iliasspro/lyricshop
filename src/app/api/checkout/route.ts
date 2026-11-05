import type { NextRequest } from "next/server";
import { parseCheckoutRequest, type CheckoutResponse } from "@/components/checkout/schema";
import { computeTotals } from "@/lib/pricing";
import { createStripeCheckout } from "./stripe-session";

// POST /api/checkout
// Validates the bag, ignores every client price and re-prices each line from the
// catalog, then either opens a Stripe Checkout Session (when STRIPE_SECRET_KEY is
// set) or tells the client to run the demo flow. POST handlers are never cached,
// with or without Cache Components.

/** Designs arrive slimmed down (layer types + visibility only), so real bags are a few KB. */
const MAX_BODY_BYTES = 256 * 1024;

function reply(body: CheckoutResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function siteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to the request's own origin.
    }
  }
  return request.nextUrl.origin;
}

/** "LS-" + 6 uppercase base-36 characters, e.g. LS-4K9Q2Z. */
function newOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `LS-${Array.from(bytes, (b) => (b % 36).toString(36)).join("").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return reply({ error: "That bag is too big to check out in one go." }, 413);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return reply({ error: "That bag is too big to check out in one go." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = parseCheckoutRequest(body);
  if (!parsed.ok) return reply({ error: parsed.error, field: parsed.field }, 400);

  const { body: checkout, lines } = parsed;
  const totals = computeTotals(lines, { promo: checkout.promo, method: checkout.method, includeTax: true });
  const unitPrices = lines.map((l) => l.unitPrice);

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return reply({ mode: "demo", totals, unitPrices });

  const orderId = newOrderId();
  try {
    const url = await createStripeCheckout({ secretKey, origin: siteOrigin(request), orderId, checkout, lines, totals });
    return reply({ mode: "stripe", url, orderId, totals, unitPrices });
  } catch (err) {
    console.error("[checkout] Could not create a Stripe Checkout Session", err);
    return reply({ error: "We couldn't reach our payment provider. Please try again in a moment." }, 502);
  }
}

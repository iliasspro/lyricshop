"use client";

// Small, device-local memory for the checkout:
// - the details used last time (so a returning shopper, or one coming back from
//   Stripe's cancel link, doesn't retype their address), and
// - the order we're waiting on while the shopper pays on Stripe's hosted page.
// Every access is wrapped: storage can be full, blocked or missing entirely.

import type { ShippingMethodId } from "@/lib/pricing";
import type { Address, Order } from "@/lib/store/library";

const DETAILS_KEY = "lyricshop-checkout-details";
const PENDING_KEY = "lyricshop-pending-order";
const CHANGE_EVENT = "lyricshop:checkout-storage";

export type CheckoutDetails = { email?: string; address?: Address; method?: ShippingMethodId };

function read(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Quota exceeded or storage disabled: the checkout still works, it just won't remember.
  }
}

function parse<T>(raw: string | null, valid: (v: unknown) => v is T): T | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return valid(value) ? value : null;
  } catch {
    return null;
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const isDetails = (v: unknown): v is CheckoutDetails =>
  isObject(v) &&
  (v.email === undefined || typeof v.email === "string") &&
  (v.method === undefined || v.method === "standard" || v.method === "express") &&
  (v.address === undefined || (isObject(v.address) && typeof v.address.country === "string"));

const isOrder = (v: unknown): v is Order =>
  isObject(v) && typeof v.id === "string" && typeof v.createdAt === "number" && Array.isArray(v.lines) && isObject(v.totals);

export function loadCheckoutDetails(): CheckoutDetails | null {
  return parse(read(DETAILS_KEY), isDetails);
}

export function saveCheckoutDetails(patch: CheckoutDetails) {
  write(DETAILS_KEY, JSON.stringify({ ...loadCheckoutDetails(), ...patch }));
}

export function savePendingOrder(order: Order) {
  write(PENDING_KEY, JSON.stringify(order));
}

export function loadPendingOrder(): Order | null {
  return parse(read(PENDING_KEY), isOrder);
}

export function clearPendingOrder() {
  write(PENDING_KEY, null);
}

/** For useSyncExternalStore: the raw pending-order string is a stable snapshot. */
export const readPendingSnapshot = () => read(PENDING_KEY);

/** The id inside a pending-order snapshot, if it holds a valid order. */
export const pendingOrderId = (snapshot: string | null) => parse(snapshot, isOrder)?.id ?? null;

export function subscribeCheckoutStorage(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === PENDING_KEY || e.key === DETAILS_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

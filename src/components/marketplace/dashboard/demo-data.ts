// Sample data for the demo artist dashboard (Maya Okafor). The pieces are her real
// catalog; every sale, order and payout below is generated from a fixed seed at module
// scope, so it is identical on every render and never depends on today's date.

import { getCreator, type Creator } from "@/lib/data/creators";
import { getProduct, type Product } from "@/lib/data/products";
import { ARTIST_SHARE } from "../constants";
import { buckets, calendar, generateSales, sum, type SalesDay } from "./generate";

export const DEMO_HANDLE = "mayaokafor";

const SLUGS = {
  tote: "heart-on-the-hook-tote",
  crewneck: "hum-it-back-crewneck",
  tee: "soft-spoken-tee",
  hoodie: "sing-it-like-you-mean-it-hoodie",
} as const;

/** Series index of the hoodie drop (Thu, Oct 15). */
const DROP_DAY = 87;

const price = (slug: string) => getProduct(slug)?.price ?? 0;

// 90 days, Mon Jul 20 → Sat Oct 17, 2026: the last 30 are "this period", the 30 before
// are the comparison, and the rest completes August for the payout history.
const DAYS = generateSales({
  seed: 3,
  days: calendar({ month: "Jul", day: 20, weekday: "Mon" }, 90),
  items: [
    { slug: SLUGS.tote, price: price(SLUGS.tote), base: 2.2 },
    { slug: SLUGS.crewneck, price: price(SLUGS.crewneck), base: 1.5 },
    { slug: SLUGS.tee, price: price(SLUGS.tee), base: 1.3 },
    { slug: SLUGS.hoodie, price: price(SLUGS.hoodie), base: 0, launch: { day: DROP_DAY, curve: [10, 6, 4] } },
  ],
  week: { Mon: 0.86, Tue: 0.84, Wed: 0.92, Thu: 0.98, Fri: 1.1, Sat: 1.28, Sun: 1.16 },
  growth: [0.95, 1.05],
  halo: { day: DROP_DAY, lift: 1.12 },
  followers: { base: 9, launch: { day: DROP_DAY, curve: [70, 40, 26] } },
});

const CURRENT = DAYS.slice(-30);
const PREVIOUS = DAYS.slice(-60, -30);
const LAST_60 = DAYS.slice(-60);
const YEAR = 2026;

const salesOf = (rows: SalesDay[]) => sum(rows, (r) => r.sales);
const ordersOf = (rows: SalesDay[]) => sum(rows, (r) => r.orders);
const followersOf = (rows: SalesDay[]) => sum(rows, (r) => r.newFollowers);
const inMonth = (month: string) => DAYS.filter((d) => d.month === month);
const cents = (n: number) => Math.round(n * 100) / 100;
const rangeLabel = (rows: SalesDay[]) => {
  const a = rows[0];
  const b = rows[rows.length - 1];
  return a.month === b.month ? `${a.label}–${b.day}` : `${a.label} – ${b.label}`;
};

export const artist: Creator = getCreator(DEMO_HANDLE)!;

export const period = {
  label: `${CURRENT[0].label} – ${CURRENT[CURRENT.length - 1].label}, ${YEAR}`,
  short: `${CURRENT[0].label} – ${CURRENT[CURRENT.length - 1].label}`,
  lastDay: CURRENT[CURRENT.length - 1].label,
};

// ---------------------------------------------------------------------------
// KPI tiles

/** 12 five-day buckets over the last 60 days: the first six are the previous period. */
const sparkBuckets = buckets(LAST_60, 5);
const sparkLabels = sparkBuckets.map((b) => rangeLabel(b));
const SPARK_ACCENT_FROM = 6;

const followersNow = artist.followers;
const followersGained = followersOf(CURRENT);
const followersAtStart = followersNow - followersOf(LAST_60);

const october = inMonth("Oct");
const septemberEarnings = cents(salesOf(inMonth("Sep")) * ARTIST_SHARE);
const augustEarnings = cents(salesOf(inMonth("Aug")) * ARTIST_SHARE);

export const kpis = {
  revenue: {
    value: salesOf(CURRENT),
    previous: salesOf(PREVIOUS),
    spark: sparkBuckets.map((b) => salesOf(b)),
  },
  orders: {
    value: ordersOf(CURRENT),
    previous: ordersOf(PREVIOUS),
    spark: sparkBuckets.map((b) => ordersOf(b)),
  },
  payoutDue: {
    value: cents(salesOf(october) * ARTIST_SHARE),
    sales: salesOf(october),
    range: rangeLabel(october),
    date: "Nov 1",
  },
  followers: {
    value: followersNow,
    gained: followersGained,
    startOfPeriod: followersNow - followersGained,
    /** Running total at the end of each bucket. */
    spark: sparkBuckets.map((_, i) => followersAtStart + followersOf(sparkBuckets.slice(0, i + 1).flat())),
  },
  sparkLabels,
  sparkAccentFrom: SPARK_ACCENT_FROM,
};

// ---------------------------------------------------------------------------
// Daily chart

export type ChartPoint = { label: string; weekday: string; sales: number; orders: number };

export const daily: ChartPoint[] = CURRENT.map((d) => ({
  label: d.label,
  weekday: d.weekday,
  sales: d.sales,
  orders: d.orders,
}));

export const dropAnnotation = {
  index: DROP_DAY - (DAYS.length - CURRENT.length),
  label: "Hoodie drop",
};

// ---------------------------------------------------------------------------
// Top pieces (her real catalog, sample sales)

export type TopProduct = { product: Product; units: number; revenue: number; earnings: number; share: number };

const revenueTotal = salesOf(CURRENT);

export const topProducts: TopProduct[] = Object.values(SLUGS)
  .map((slug) => getProduct(slug))
  .filter((p): p is Product => !!p)
  .map((product) => {
    const units = sum(CURRENT, (d) => d.units[product.slug] ?? 0);
    const revenue = units * product.price;
    return {
      product,
      units,
      revenue,
      earnings: cents(revenue * ARTIST_SHARE),
      share: revenueTotal ? revenue / revenueTotal : 0,
    };
  })
  .sort((a, b) => b.revenue - a.revenue);

// ---------------------------------------------------------------------------
// Recent orders: the latest from the final day (matches its per-piece counts).

export type OrderStatus = "new" | "printing" | "packed";

export type DemoOrder = {
  id: string;
  slug: string;
  color: string;
  size: string;
  city: string;
  time: string;
  status: OrderStatus;
};

const lastDay = CURRENT[CURRENT.length - 1];

const ORDERS: DemoOrder[] = [
  { id: "LS-30418", slug: SLUGS.hoodie, color: "lilac", size: "M", city: "Brooklyn, NY", time: "9:41 PM", status: "new" },
  { id: "LS-30411", slug: SLUGS.tote, color: "natural", size: "One size", city: "Atlanta, GA", time: "8:12 PM", status: "new" },
  { id: "LS-30396", slug: SLUGS.hoodie, color: "black", size: "L", city: "Toronto, ON", time: "6:55 PM", status: "printing" },
  { id: "LS-30372", slug: SLUGS.crewneck, color: "sage", size: "S", city: "Portland, OR", time: "4:03 PM", status: "printing" },
  { id: "LS-30340", slug: SLUGS.tee, color: "white", size: "M", city: "Austin, TX", time: "1:37 PM", status: "printing" },
  { id: "LS-30317", slug: SLUGS.hoodie, color: "bone", size: "XL", city: "Manchester, UK", time: "11:20 AM", status: "packed" },
];

export const recentOrders = {
  day: lastDay.label,
  count: lastDay.orders,
  sales: lastDay.sales,
  orders: ORDERS,
};

// ---------------------------------------------------------------------------
// Payouts

export const payouts = {
  next: { date: `Nov 1, ${YEAR}`, period: `October (${kpis.payoutDue.range})`, amount: kpis.payoutDue.value, sales: kpis.payoutDue.sales },
  history: [
    { date: `Oct 1, ${YEAR}`, period: "September", amount: septemberEarnings },
    { date: `Sep 1, ${YEAR}`, period: "August", amount: augustEarnings },
  ],
};

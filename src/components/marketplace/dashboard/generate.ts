// Seeded sample-data generator for the demo artist dashboard. Pure and deterministic:
// the same config always yields the same numbers on the server and in the browser, and
// nothing reads the clock or Math.random().

/** Small, fast 32-bit PRNG (mulberry32). Returns floats in [0, 1). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type CalendarDay = {
  /** 0-based position in the series. */
  index: number;
  month: string;
  day: number;
  weekday: string;
  /** "Sep 18" */
  label: string;
};

const MONTHS: [name: string, days: number][] = [
  ["Jan", 31],
  ["Feb", 28],
  ["Mar", 31],
  ["Apr", 30],
  ["May", 31],
  ["Jun", 30],
  ["Jul", 31],
  ["Aug", 31],
  ["Sep", 30],
  ["Oct", 31],
  ["Nov", 30],
  ["Dec", 31],
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A run of consecutive calendar days (non-leap year), counted without Date. */
export function calendar(start: { month: string; day: number; weekday: string }, length: number): CalendarDay[] {
  let m = MONTHS.findIndex(([name]) => name === start.month);
  let d = start.day;
  let w = WEEKDAYS.indexOf(start.weekday);
  const days: CalendarDay[] = [];
  for (let i = 0; i < length; i++) {
    const month = MONTHS[m][0];
    days.push({ index: i, month, day: d, weekday: WEEKDAYS[w], label: `${month} ${d}` });
    d += 1;
    w = (w + 1) % 7;
    if (d > MONTHS[m][1]) {
      d = 1;
      m = (m + 1) % 12;
    }
  }
  return days;
}

export type DemandItem = {
  slug: string;
  price: number;
  /** Expected units a day before weekday and growth effects. 0 = launches later. */
  base: number;
  /** Units expected on each day from the launch day onwards (decays after the last entry). */
  launch?: { day: number; curve: number[] };
};

export type SalesConfig = {
  seed: number;
  days: CalendarDay[];
  items: DemandItem[];
  /** Weekday demand multipliers. */
  week: Record<string, number>;
  /** Linear demand growth across the series, e.g. [0.95, 1.05]. */
  growth: [number, number];
  /** Lift on the back catalog from the day a launch happens. */
  halo?: { day: number; lift: number };
  followers: { base: number; launch?: { day: number; curve: number[] } };
};

export type SalesDay = CalendarDay & {
  units: Record<string, number>;
  orders: number;
  sales: number;
  newFollowers: number;
};

/**
 * Daily units per piece with bounded noise (lumpy like a small shop, never wild).
 * Each piece sells one unit per order, so orders = units.
 */
export function generateSales(config: SalesConfig): SalesDay[] {
  const rand = mulberry32(config.seed);
  const draw = (lambda: number) => Math.max(0, Math.round(lambda * (0.55 + rand() * 0.9)));
  const last = config.days.length - 1;
  const [g0, g1] = config.growth;

  return config.days.map((day) => {
    const growth = g0 + ((g1 - g0) * day.index) / last;
    const weekday = config.week[day.weekday] ?? 1;
    const halo = config.halo && day.index >= config.halo.day ? config.halo.lift : 1;

    const units: Record<string, number> = {};
    for (const item of config.items) {
      let lambda = item.base * growth * weekday * halo;
      if (item.launch) {
        const since = day.index - item.launch.day;
        lambda = since < 0 ? 0 : (item.launch.curve[since] ?? item.launch.curve[item.launch.curve.length - 1] * 0.6);
      }
      units[item.slug] = lambda > 0 ? draw(lambda) : 0;
    }

    const { followers } = config;
    const since = followers.launch ? day.index - followers.launch.day : -1;
    const followerLambda =
      followers.launch && since >= 0 && since < followers.launch.curve.length
        ? followers.launch.curve[since]
        : followers.base * growth * weekday;

    const orders = Object.values(units).reduce((n, u) => n + u, 0);
    const sales = config.items.reduce((s, item) => s + units[item.slug] * item.price, 0);
    return { ...day, units, orders, sales, newFollowers: draw(followerLambda) };
  });
}

export const sum = <T,>(rows: T[], pick: (row: T) => number) => rows.reduce((n, r) => n + pick(r), 0);

/** Splits rows into consecutive buckets of `size` (the last bucket may be shorter). */
export function buckets<T>(rows: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

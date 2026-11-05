// Number formatting shared by the marketplace pages (storefronts, sell, dashboard).

const trimZero = (s: string) => s.replace(/\.0$/, "");

/** Follower-style compact counts: 960 → "960", 12840 → "12.8k", 1250000 → "1.3m". */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1000) return String(Math.round(n));
  if (abs < 1_000_000) return `${trimZero((n / 1000).toFixed(1))}k`;
  return `${trimZero((n / 1_000_000).toFixed(1))}m`;
}

/** Compact money for axis ticks: 300 → "$300", 1200 → "$1.2k". */
export function formatMoneyCompact(n: number): string {
  if (Math.abs(n) < 1000) return `$${Math.round(n)}`;
  return `$${formatCompact(n)}`;
}

/** Whole numbers with separators: 8120 → "8,120". */
export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Signed percentage from a ratio: 0.25 → "+25.0%", -0.042 → "−4.2%". */
export function formatSignedPercent(ratio: number, digits = 1): string {
  const sign = ratio > 0 ? "+" : ratio < 0 ? "−" : "±";
  return `${sign}${Math.abs(ratio * 100).toFixed(digits)}%`;
}

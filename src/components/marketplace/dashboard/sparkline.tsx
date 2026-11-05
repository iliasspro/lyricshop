"use client";

import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { formatCount } from "../format";
import { useScrub } from "./scrub";
import { VIZ } from "./viz";

export type SparklineProps = {
  values: number[];
  labels: string[];
  /** Index where the current period starts: earlier points use the de-emphasis gray. */
  accentFrom: number;
  format: "money" | "count";
  /** What the line shows, for assistive tech ("Revenue"). */
  name: string;
  className?: string;
};

/** 12-point trend line for a stat tile: previous period in gray, current period in the accent. */
export function Sparkline({ values, labels, accentFrom, format, name, className }: SparklineProps) {
  const n = values.length;
  const { active, handlers } = useScrub(n);
  if (n < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.14 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const x = (i: number) => (i / (n - 1)) * 100;
  const y = (v: number) => (1 - (v - lo) / (hi - lo)) * 100;
  const path = (from: number, to: number) =>
    values
      .slice(from, to + 1)
      .map((v, k) => `${k ? "L" : "M"}${(x(from + k) * 10).toFixed(1)} ${(y(v) * 10).toFixed(1)}`)
      .join("");
  const fmt = (v: number) => (format === "money" ? formatPrice(v) : formatCount(v));
  const last = n - 1;
  const split = Math.max(0, Math.min(last, accentFrom - 1));

  return (
    <div className={cn("relative", className)}>
      <div
        role="group"
        tabIndex={0}
        aria-label={`${name}, ${labels[0]} to ${labels[last]} in five-day steps. Use the arrow keys to read each step.`}
        className="relative h-10 cursor-crosshair touch-pan-y rounded-md"
        {...handlers}
      >
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          {active !== null && (
            <line
              x1={x(active) * 10}
              x2={x(active) * 10}
              y1={0}
              y2={1000}
              stroke={VIZ.ink}
              strokeOpacity={0.18}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}
          <path
            d={path(0, split)}
            fill="none"
            stroke={VIZ.muted}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path(split, last)}
            fill="none"
            stroke={VIZ.series}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <Dot left={x(last)} top={y(values[last])} color={VIZ.series} />
        {active !== null && active !== last && (
          <Dot left={x(active)} top={y(values[active])} color={active >= accentFrom ? VIZ.series : VIZ.muted} />
        )}
        {active !== null && (
          <div
            className={cn(
              "pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-bone shadow-lg",
              x(active) < 18 ? "translate-x-0" : x(active) > 82 ? "-translate-x-full" : "-translate-x-1/2",
            )}
            style={{ left: `${x(active)}%` }}
          >
            <span className="font-semibold">{fmt(values[active])}</span>
            <span className="ml-1.5 text-bone/60">{labels[active]}</span>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {active !== null ? `${labels[active]}: ${fmt(values[active])}` : ""}
      </p>
    </div>
  );
}

function Dot({ left, top, color }: { left: number; top: number; color: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#fbf9f6]"
      style={{ left: `${left}%`, top: `${top}%`, background: color }}
    />
  );
}

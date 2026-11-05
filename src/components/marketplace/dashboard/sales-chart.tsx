"use client";

import { ChartSpline, Table2 } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { formatMoneyCompact } from "../format";
import type { ChartPoint } from "./demo-data";
import { niceScale, useScrub } from "./scrub";
import { VIZ } from "./viz";

const DAY_NAMES: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

/**
 * Daily revenue for one period as a single-series area chart on the ink card.
 * Single series → no legend box (the title names it). Hover/focus shows a crosshair readout;
 * the table view is the accessible twin with every value.
 */
export function SalesChart({
  points,
  period,
  annotation,
}: {
  points: ChartPoint[];
  period: string;
  annotation?: { index: number; label: string };
}) {
  const id = useId();
  const [view, setView] = useState<"chart" | "table">("chart");
  const n = points.length;
  const { active, handlers } = useScrub(n);

  const total = points.reduce((s, p) => s + p.sales, 0);
  const orders = points.reduce((s, p) => s + p.orders, 0);
  const best = points.reduce((b, p, i) => (p.sales > points[b].sales ? i : b), 0);
  const { top, ticks } = niceScale(Math.max(...points.map((p) => p.sales)), 4);

  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => (1 - v / top) * 100;
  const line = points.map((p, i) => `${i ? "L" : "M"}${(x(i) * 10).toFixed(1)} ${(y(p.sales) * 10).toFixed(1)}`).join("");
  const area = `${line}L1000 1000L0 1000Z`;
  const xTicks = [0, 7, 14, 21, n - 1].filter((i, k, all) => i < n && all.indexOf(i) === k);
  const last = n - 1;
  const describe = (i: number) =>
    `${DAY_NAMES[points[i].weekday] ?? points[i].weekday}, ${points[i].label}: ${formatPrice(points[i].sales)} from ${points[i].orders} ${points[i].orders === 1 ? "order" : "orders"}`;

  return (
    <figure className="flex h-full flex-col rounded-[28px] bg-ink p-5 text-bone md:p-8">
      <figcaption className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Daily revenue</h2>
          <p className="mt-0.5 text-sm text-bone/60">Gross sales of your pieces · {period}</p>
        </div>
        <div className="flex rounded-full bg-bone/8 p-1" role="group" aria-label="Show revenue as">
          {(
            [
              { v: "chart", label: "Chart", icon: ChartSpline },
              { v: "table", label: "Table", icon: Table2 },
            ] as const
          ).map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-controls={`${id}-view`}
              onClick={() => setView(v)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm transition",
                view === v ? "bg-bone text-ink" : "text-bone/70 hover:text-bone",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </figcaption>

      <div id={`${id}-view`} className="mt-8 flex-1">
        {view === "chart" ? (
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
            {/* y axis */}
            <div className="relative h-60 w-9 md:h-72" aria-hidden>
              {ticks.map((t) => (
                <span
                  key={t}
                  className="absolute right-0 -translate-y-1/2 font-mono text-[11px] tabular-nums text-ash"
                  style={{ top: `${y(t)}%` }}
                >
                  {formatMoneyCompact(t)}
                </span>
              ))}
            </div>

            {/* plot */}
            <div
              role="group"
              tabIndex={0}
              aria-label={`Daily revenue, ${period}. Use the left and right arrow keys to read each day.`}
              className="relative h-60 cursor-crosshair touch-pan-y rounded-sm md:h-72"
              {...handlers}
            >
              <svg
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden
              >
                {ticks.map((t) => (
                  <line
                    key={t}
                    x1={0}
                    x2={1000}
                    y1={y(t) * 10}
                    y2={y(t) * 10}
                    stroke="#F3EEE5"
                    strokeOpacity={t === 0 ? 0.22 : 0.09}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {annotation && annotation.index >= 0 && annotation.index < n && (
                  <line
                    x1={x(annotation.index) * 10}
                    x2={x(annotation.index) * 10}
                    y1={0}
                    y2={1000}
                    stroke="#F3EEE5"
                    strokeOpacity={0.22}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                <path d={area} fill={VIZ.series} fillOpacity={0.1} />
                <path
                  d={line}
                  fill="none"
                  stroke={VIZ.series}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {active !== null && (
                  <line
                    x1={x(active) * 10}
                    x2={x(active) * 10}
                    y1={0}
                    y2={1000}
                    stroke="#F3EEE5"
                    strokeOpacity={0.45}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>

              {annotation && annotation.index >= 0 && annotation.index < n && (
                <div
                  className="pointer-events-none absolute -translate-x-full pr-2.5 text-right"
                  style={{ left: `${x(annotation.index)}%`, top: 0 }}
                  aria-hidden
                >
                  <p className="whitespace-nowrap text-xs font-medium text-bone">{annotation.label}</p>
                  <p className="whitespace-nowrap text-xs text-bone/60">
                    {points[annotation.index].label} · {formatPrice(points[annotation.index].sales)}
                  </p>
                </div>
              )}

              <Marker left={x(last)} top={y(points[last].sales)} />
              {active !== null && active !== last && <Marker left={x(active)} top={y(points[active].sales)} />}

              {active !== null && (
                <div
                  className={cn(
                    "pointer-events-none absolute z-10 -translate-y-1/2 rounded-xl bg-bone px-3 py-2 text-ink shadow-[0_12px_32px_-8px_rgba(0,0,0,.6)]",
                    x(active) > 62 ? "-translate-x-[calc(100%+14px)]" : "translate-x-[14px]",
                  )}
                  style={{ left: `${x(active)}%`, top: `${Math.min(82, Math.max(18, y(points[active].sales)))}%` }}
                  aria-hidden
                >
                  <p className="whitespace-nowrap text-[11px] text-smoke">
                    {points[active].weekday}, {points[active].label}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 whitespace-nowrap">
                    <span className="h-0.5 w-3 rounded-full" style={{ background: VIZ.series }} />
                    <span className="font-semibold">{formatPrice(points[active].sales)}</span>
                    <span className="text-xs text-smoke">revenue</span>
                  </p>
                  <p className="whitespace-nowrap pl-5 text-xs text-smoke">
                    {points[active].orders} {points[active].orders === 1 ? "order" : "orders"}
                  </p>
                </div>
              )}
            </div>

            {/* x axis */}
            <div aria-hidden />
            <div className="relative mt-3 h-4" aria-hidden>
              {xTicks.map((i) => (
                <span
                  key={i}
                  className={cn(
                    "absolute whitespace-nowrap font-mono text-[11px] text-ash",
                    i === 0 ? "" : i === last ? "-translate-x-full" : "-translate-x-1/2",
                  )}
                  style={{ left: `${x(i)}%` }}
                >
                  {points[i].label}
                </span>
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              {active !== null ? describe(active) : ""}
            </p>
          </div>
        ) : (
          <div className="max-h-[19.5rem] overflow-auto rounded-2xl ring-1 ring-bone/10 md:max-h-[21.5rem]">
            <table className="w-full text-sm">
              <caption className="sr-only">Daily revenue and orders, {period}</caption>
              <thead className="sticky top-0 bg-ink-2 text-left text-bone/60">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-normal">
                    Day
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-normal">
                    Orders
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-normal">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/8">
                {points.map((p, i) => (
                  <tr key={p.label} className={cn(i === best && "bg-bone/[0.04]")}>
                    <th scope="row" className="px-4 py-2 text-left font-normal text-bone/80">
                      {p.weekday}, {p.label}
                      {annotation?.index === i && <span className="ml-2 text-xs text-bone/50">{annotation.label}</span>}
                    </th>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{p.orders}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">{formatPrice(p.sales)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-ink-2">
                <tr>
                  <th scope="row" className="px-4 py-2.5 text-left font-medium">
                    Total
                  </th>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{orders}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatPrice(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-bone/10 pt-5 text-sm">
        <div>
          <dt className="text-bone/55">Daily average</dt>
          <dd className="mt-1 font-mono tabular-nums">{formatPrice(Math.round(total / n))}</dd>
        </div>
        <div>
          <dt className="text-bone/55">Best day</dt>
          <dd className="mt-1 font-mono tabular-nums">
            {points[best].label} · {formatPrice(points[best].sales)}
          </dd>
        </div>
        <div>
          <dt className="text-bone/55">Orders</dt>
          <dd className="mt-1 font-mono tabular-nums">{orders}</dd>
        </div>
      </dl>
    </figure>
  );
}

/** ≥8px end/hover marker with a 2px ring in the card's surface color. */
function Marker({ left, top }: { left: number; top: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ink"
      style={{ left: `${left}%`, top: `${top}%`, background: VIZ.series }}
    />
  );
}

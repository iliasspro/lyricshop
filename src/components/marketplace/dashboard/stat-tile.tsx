import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Sparkline, type SparklineProps } from "./sparkline";
import { TILE } from "./viz";

export type Delta = {
  /** Signed change used for direction (ratio or absolute). */
  change: number;
  /** Display text, e.g. "+25.0%". */
  text: string;
  /** Whether "up" is good for this metric. Defaults to true. */
  upIsGood?: boolean;
};

/**
 * Stat tile contract: label · value (sans semibold, proportional figures) · delta vs a named
 * period (direction × whether up is good, always icon + text) · optional 12-point trend.
 */
export function StatTile({
  label,
  value,
  delta,
  note,
  spark,
  footer,
  className,
}: {
  label: string;
  value: string;
  delta?: Delta;
  note?: ReactNode;
  spark?: SparklineProps;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(TILE, "flex flex-col p-5 md:p-6", className)}>
      <p className="text-sm text-smoke">{label}</p>
      <p className="mt-3 font-sans text-[clamp(2rem,2.6vw,2.5rem)] font-semibold leading-none tracking-[-0.035em]">{value}</p>
      {(delta || note) && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {delta && <DeltaText delta={delta} />}
          {note && <span className="text-smoke">{note}</span>}
        </p>
      )}
      {spark && <Sparkline {...spark} className="mt-auto pt-6" />}
      {footer && <div className="mt-auto pt-6">{footer}</div>}
    </div>
  );
}

function DeltaText({ delta }: { delta: Delta }) {
  const up = delta.change > 0;
  const flat = delta.change === 0;
  const good = flat ? null : up === (delta.upIsGood ?? true);
  const Icon = flat ? ArrowRight : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        good === null ? "text-smoke" : good ? "text-ok" : "text-red-deep",
      )}
    >
      <Icon className="size-4" aria-hidden />
      <span className="sr-only">{flat ? "No change" : up ? "Up" : "Down"}</span>
      {delta.text}
    </span>
  );
}

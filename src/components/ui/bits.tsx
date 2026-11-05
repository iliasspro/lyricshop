import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Badge } from "@/lib/data/products";
import { formatPrice } from "@/lib/pricing";

export function Price({ value, compareAt, className }: { value: number; compareAt?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 font-mono tabular-nums", className)}>
      <span>{formatPrice(value)}</span>
      {compareAt && compareAt > value && <s className="text-smoke">{formatPrice(compareAt)}</s>}
    </span>
  );
}

export function Stars({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)} aria-label={`Rated ${rating} out of 5`}>
      <span className="flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className="relative inline-block size-3.5">
              <Star className="absolute inset-0 size-3.5 text-current opacity-25" strokeWidth={0} fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="size-3.5 text-current" strokeWidth={0} fill="currentColor" />
              </span>
            </span>
          );
        })}
      </span>
      <span className="font-mono text-xs tabular-nums">
        {rating.toFixed(1)}
        {count !== undefined && <span className="text-smoke"> ({count})</span>}
      </span>
    </span>
  );
}

const BADGE_STYLE: Record<Badge, { label: string; className: string }> = {
  new: { label: "New drop", className: "bg-red text-ink" },
  bestseller: { label: "Bestseller", className: "bg-ink text-bone" },
  limited: { label: "Limited run", className: "bg-tape text-ink" },
  "low-stock": { label: "Almost gone", className: "bg-bone text-ink ring-1 ring-ink/15" },
};

export function ProductBadge({ badge, className }: { badge: Badge; className?: string }) {
  const s = BADGE_STYLE[badge];
  return (
    <span className={cn("eyebrow inline-flex h-6 items-center rounded-full px-2.5 !text-[10px] font-medium", s.className, className)}>
      {s.label}
    </span>
  );
}

export function Eyebrow({ children, className, dot = false }: { children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <p className={cn("eyebrow inline-flex items-center gap-2", className)}>
      {dot && <span className="size-1.5 animate-pulse-dot rounded-full bg-red" />}
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  aside,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow className="mb-4 text-smoke">{eyebrow}</Eyebrow>}
        <h2 className="display text-[clamp(2.2rem,5vw,4.4rem)]">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export function Swatch({
  hex,
  label,
  selected,
  onClick,
  size = "md",
}: {
  hex: string;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "size-4" : size === "lg" ? "size-9" : "size-7";
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={onClick ? selected : undefined}
      className={cn(
        "relative inline-flex shrink-0 rounded-full ring-offset-2 ring-offset-bone transition-shadow duration-200",
        dim,
        selected ? "ring-2 ring-ink" : onClick && "hover:ring-2 hover:ring-ink/30",
      )}
    >
      <span className="absolute inset-0 rounded-full border border-ink/15" style={{ background: hex }} />
    </Comp>
  );
}

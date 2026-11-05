"use client";

import { Minus, Plus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { formatPrice } from "@/lib/pricing";
import { useCart, type CartLine as Line } from "@/lib/store/cart";

export function CartLineItem({ line, compact = false }: { line: Line; compact?: boolean }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const color = colorFor(line.color);
  const creator = line.creator ? CREATOR_BY_HANDLE[line.creator] : null;
  const href = line.kind === "product" ? `/product/${line.slug}?color=${line.color}` : `/studio?design=${line.designId}`;
  const view = line.design.front.length === 0 && line.design.back.length > 0 ? "back" : "front";

  return (
    <div className={cn("flex gap-4", compact ? "py-4" : "py-6")}>
      <Link
        href={href}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl bg-[#e5ddcf] p-1.5",
          compact ? "size-24" : "size-32",
        )}
      >
        <GarmentMockup garment={line.garment} color={color.hex} view={view} layers={line.design[view]} shadow={false} className="h-full w-full" />
        {line.kind === "custom" && (
          <span className="absolute left-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-red text-ink">
            <Sparkles className="size-3" />
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="line-clamp-2 font-medium leading-snug hover:underline">
              {line.title}
            </Link>
            <p className="mt-1 text-sm text-smoke">
              {line.kind === "custom" ? "Your design" : creator ? `by ${creator.name}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(line.key)}
            className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-smoke transition hover:bg-ink/6 hover:text-ink"
            aria-label={`Remove ${line.title}`}
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-smoke">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full border border-ink/15" style={{ background: color.hex }} />
            {color.name}
          </span>
          <span>Size {line.size}</span>
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex h-9 items-center rounded-full border border-ink/12">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full transition hover:bg-ink/6"
              onClick={() => setQty(line.key, line.qty - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center font-mono text-sm tabular-nums" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full transition hover:bg-ink/6"
              onClick={() => setQty(line.key, line.qty + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="font-mono text-sm tabular-nums">{formatPrice(line.unitPrice * line.qty)}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { BRAND_PALETTE, type BrandColor } from "./brand-data";

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Brand swatches; clicking one copies its hex. */
export function Palette() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async (c: BrandColor) => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(c.hex);
      setCopied(c.hex);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1600);
      toast.success(`Copied ${c.hex}`, { description: `${c.name} is on your clipboard.` });
    } catch {
      toast.error("Couldn't reach the clipboard", { description: `Here it is to copy by hand: ${c.hex}` });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
      {BRAND_PALETTE.map((c, i) => {
        const primary = i < 3;
        const done = copied === c.hex;
        return (
          <button
            key={c.hex}
            type="button"
            onClick={() => copy(c)}
            aria-label={`Copy ${c.name} ${c.hex}`}
            className={cn(
              "group/swatch relative flex flex-col overflow-hidden rounded-[24px] text-left ring-1 ring-ink/10 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(15,14,13,.5)]",
              primary ? "col-span-2 md:col-span-4" : "col-span-1 md:col-span-3",
            )}
          >
            <span
              className={cn(
                "relative flex w-full items-start justify-between p-5",
                primary ? "aspect-[4/3] md:aspect-[5/4]" : "aspect-[4/3]",
                c.dark ? "text-bone" : "text-ink",
              )}
              style={{ background: c.hex }}
            >
              <span className="eyebrow opacity-70">{c.role}</span>
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full transition duration-300",
                  c.dark ? "bg-bone/12" : "bg-ink/8",
                  done ? "scale-110" : "opacity-0 group-hover/swatch:opacity-100 group-focus-visible/swatch:opacity-100",
                )}
                aria-hidden
              >
                {done ? <Check className="size-4" /> : <Copy className="size-4" />}
              </span>
              {primary && (
                <span className="display absolute bottom-4 left-5 text-[clamp(2.4rem,5vw,4rem)] leading-none" aria-hidden>
                  {c.name === "On-Air Red" ? "Red" : c.name}
                </span>
              )}
            </span>
            <span className="flex flex-1 flex-col gap-2 bg-bone p-5">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-medium">{c.name}</span>
                <span className="font-mono text-sm tabular-nums">{done ? "Copied" : c.hex}</span>
              </span>
              <span className="font-mono text-[11px] text-smoke">
                RGB {rgb(c.hex)} · {c.token}
              </span>
              <span className={cn("text-sm text-smoke", !primary && "max-md:hidden")}>{c.note}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FaqItem = { q: string; a: ReactNode };

/** Accordion that keeps every answer in the DOM (findable, indexable) and animates height with grid rows. */
export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const base = useId();

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className={cn("divide-y divide-ink/10 border-y border-ink/10", className)}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const btn = `${base}-q${i}`;
        const panel = `${base}-a${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => toggle(i)}
                className="group/faq flex w-full items-center gap-6 py-6 text-left"
              >
                <span className="flex-1 text-lg font-medium tracking-[-0.01em] md:text-xl">{item.q}</span>
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full border transition duration-500 ease-[var(--ease-out-expo)]",
                    isOpen ? "rotate-45 border-red bg-red text-ink" : "border-ink/15 group-hover/faq:border-ink",
                  )}
                  aria-hidden
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={panel}
              role="region"
              aria-labelledby={btn}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="max-w-2xl pb-7 pr-16 text-smoke [&_a]:text-ink [&_a]:underline [&_a]:decoration-ink/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-ink">
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

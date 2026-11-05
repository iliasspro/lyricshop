"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type FaqItem = { q: string; a: string };

/** Disclosure list: any number of answers can be open; the first starts open. */
export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  const id = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className={cn("border-t border-ink/12", className)}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const button = `${id}-q${i}`;
        const panel = `${id}-a${i}`;
        return (
          <div key={item.q} className="border-b border-ink/12">
            <h3>
              <button
                id={button}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => toggle(i)}
                className="group/faq flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-[-0.01em] md:text-xl"
              >
                <span className="transition group-hover/faq:text-red">{item.q}</span>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border transition duration-500 ease-[var(--ease-out-expo)]",
                    isOpen ? "rotate-45 border-ink bg-ink text-bone" : "border-ink/15",
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
              aria-labelledby={button}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-7 pr-12 leading-relaxed text-smoke">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

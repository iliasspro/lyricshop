"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type SectionLink = { id: string; label: string };

function useActiveSection(ids: string) {
  const [active, setActive] = useState(() => ids.split("|")[0]);

  useEffect(() => {
    const list = ids.split("|");
    const els = list.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const inView = new Set<string>();
    // A thin band a third of the way down the viewport decides which section is "playing".
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inView.add(e.target.id);
          else inView.delete(e.target.id);
        }
        const first = list.find((id) => inView.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-32% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return [active, setActive] as const;
}

/**
 * In-page table of contents that follows the section in view.
 * `rail`: chips on small screens, a sticky vertical list from lg up.
 * `bar`: a sticky horizontal strip that sits under the site header.
 */
export function SectionNav({
  links,
  variant = "rail",
  className,
  label = "On this page",
}: {
  links: SectionLink[];
  variant?: "rail" | "bar";
  className?: string;
  label?: string;
}) {
  const ids = links.map((l) => l.id).join("|");
  const [active, setActive] = useActiveSection(ids);
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the active chip visible in horizontal layouts.
  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const chip = el.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!chip) return;
    el.scrollTo({ left: chip.offsetLeft - el.clientWidth / 2 + chip.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  if (variant === "bar") {
    return (
      <nav
        aria-label={label}
        className={cn(
          "sticky top-16 z-30 border-y border-ink/8 bg-bone/85 backdrop-blur-xl md:top-[72px]",
          className,
        )}
      >
        <div ref={scroller} className="no-scrollbar container-page relative flex gap-1 overflow-x-auto py-2.5">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              data-section={l.id}
              onClick={() => setActive(l.id)}
              aria-current={active === l.id ? "location" : undefined}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm transition-colors",
                active === l.id ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/6 hover:text-ink",
              )}
            >
              <span className={cn("font-mono text-[10px]", active === l.id ? "text-red" : "text-smoke")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label={label} className={cn("lg:sticky lg:top-28", className)}>
      <p className="eyebrow mb-4 hidden text-smoke lg:block">{label}</p>
      <div
        ref={scroller}
        className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-ink/10 lg:px-0"
      >
        {links.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            data-section={l.id}
            onClick={() => setActive(l.id)}
            aria-current={active === l.id ? "location" : undefined}
            className={cn(
              "relative flex h-9 shrink-0 items-center rounded-full border px-4 text-sm transition-colors lg:-ml-px lg:h-auto lg:rounded-none lg:border-0 lg:border-l-2 lg:py-2 lg:pl-5 lg:text-[15px]",
              active === l.id
                ? "border-ink bg-ink text-bone lg:border-red lg:bg-transparent lg:font-medium lg:text-ink"
                : "border-ink/12 text-ink/70 hover:text-ink lg:border-transparent",
            )}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

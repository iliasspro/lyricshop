// Shared hover/keyboard "scrubbing" for the dashboard charts. Imported only by client components.

import { useState, type KeyboardEvent, type PointerEvent } from "react";

/**
 * Tracks the data index under the pointer (snapping to the nearest point, so readers aim at a
 * date rather than a 2px line) and lets keyboard users step through points with the arrow keys.
 */
export function useScrub(count: number) {
  const [active, setActive] = useState<number | null>(null);
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));

  const fromPointer = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return count - 1;
    return clamp(Math.round(((e.clientX - rect.left) / rect.width) * (count - 1)));
  };

  const handlers = {
    onPointerMove: (e: PointerEvent<HTMLElement>) => setActive(fromPointer(e)),
    onPointerDown: (e: PointerEvent<HTMLElement>) => setActive(fromPointer(e)),
    onPointerLeave: () => setActive(null),
    onFocus: () => setActive((a) => a ?? count - 1),
    onBlur: () => setActive(null),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") {
        setActive(null);
        return;
      }
      const step: Record<string, (a: number) => number> = {
        ArrowLeft: (a) => a - 1,
        ArrowRight: (a) => a + 1,
        Home: () => 0,
        End: () => count - 1,
      };
      const move = step[e.key];
      if (!move) return;
      e.preventDefault();
      setActive((a) => clamp(move(a ?? count - 1)));
    },
  };

  return { active, handlers };
}

/** Clean axis ticks from zero: 1096 → 0, 300, 600, 900, 1200. */
export function niceScale(max: number, intervals = 4) {
  if (!(max > 0)) return { top: 1, ticks: [0, 1] };
  const raw = max / intervals;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((s) => s * pow).find((s) => s >= raw) ?? 10 * pow;
  const n = Math.ceil(max / step);
  return { top: n * step, ticks: Array.from({ length: n + 1 }, (_, i) => i * step) };
}

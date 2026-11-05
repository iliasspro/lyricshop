"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { Mark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

/**
 * The mark with its records spinning. The animation always runs and is paused with CSS,
 * so lifting the needle stops the records where they are instead of snapping back.
 */
export function RecordPlayer({
  tone = "bone",
  className,
  markClassName,
  hoverToPlay = true,
  control = false,
  autoPlay = false,
}: {
  tone?: "ink" | "bone";
  className?: string;
  markClassName?: string;
  hoverToPlay?: boolean;
  /** Show a play / pause button under the mark. */
  control?: boolean;
  autoPlay?: boolean;
}) {
  const [playing, setPlaying] = useState(autoPlay);
  const [hovered, setHovered] = useState(false);
  const spinning = playing || (hoverToPlay && hovered);

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      onPointerEnter={hoverToPlay ? () => setHovered(true) : undefined}
      onPointerLeave={hoverToPlay ? () => setHovered(false) : undefined}
    >
      <div className={cn("flex w-full justify-center", !spinning && "[&_g]:[animation-play-state:paused]!")}>
        <Mark tone={tone} spin className={markClassName} />
      </div>
      {control && (
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className={cn(
            "mt-8 inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-sm font-medium transition-colors",
            tone === "bone"
              ? "border-bone/25 text-bone hover:border-bone hover:bg-bone hover:text-ink"
              : "border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-bone",
          )}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Lift the needle" : "Drop the needle"}
        </button>
      )}
    </div>
  );
}

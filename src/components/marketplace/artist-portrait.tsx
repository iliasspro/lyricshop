import Image from "next/image";
import { Mark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";
import type { Creator } from "@/lib/data/creators";

/**
 * An artist's photo, or the brand mark on an ink tile for in-house lines without a portrait.
 * The wrapper is the positioning context for the photo: pass a position and a size
 * (e.g. "absolute inset-0" or "relative aspect-square"). Classes are not merged, so the base sets neither.
 */
export function ArtistPortrait({
  creator,
  sizes,
  className,
  imageClassName,
  markClassName,
  markSize = "w-[46%] max-w-56",
  preload = false,
  decorative = false,
}: {
  creator: Creator;
  sizes: string;
  className?: string;
  imageClassName?: string;
  markClassName?: string;
  /** Width classes for the brand mark (replaces the default rather than merging with it). */
  markSize?: string;
  preload?: boolean;
  /** Hide from assistive tech when the name is already announced next to it. */
  decorative?: boolean;
}) {
  if (!creator.avatar) {
    return (
      <div
        className={cn("grid place-items-center overflow-hidden bg-ink", className)}
        aria-hidden={decorative || undefined}
      >
        <Mark tone="bone" title={creator.name} className={cn("h-auto", markSize, markClassName)} />
      </div>
    );
  }
  return (
    <div className={cn("overflow-hidden bg-paper", className)}>
      <Image
        src={creator.avatar}
        alt={decorative ? "" : `${creator.name}, ${creator.role.toLowerCase()} from ${creator.location}`}
        fill
        sizes={sizes}
        preload={preload}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Creator } from "@/lib/data/creators";
import { ArtistPortrait } from "./artist-portrait";
import { formatCompact } from "./format";

const HOVER_IMAGE =
  "grayscale-[35%] transition duration-700 ease-[var(--ease-out-expo)] group-hover/artist:scale-105 group-hover/artist:grayscale-0";
const HOVER_MARK = "transition duration-700 ease-[var(--ease-out-expo)] group-hover/artist:scale-110";

/** Directory card: portrait, name, where they're from and the line they live by. */
export function ArtistCard({
  creator,
  pieces,
  sizes,
  className,
}: {
  creator: Creator;
  pieces: number;
  sizes: string;
  className?: string;
}) {
  return (
    <Link href={`/artists/${creator.handle}`} className={cn("group/artist flex flex-col", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[24px]">
        <ArtistPortrait
          creator={creator}
          decorative
          sizes={sizes}
          className="absolute inset-0"
          imageClassName={HOVER_IMAGE}
          markClassName={HOVER_MARK}
        />
        <span className="absolute left-3 top-3 rounded-full bg-bone/85 px-2.5 py-1 font-mono text-[11px] tabular-nums text-ink backdrop-blur">
          {pieces} {pieces === 1 ? "piece" : "pieces"}
        </span>
        <span
          className="absolute bottom-3 right-3 grid size-10 translate-y-2 place-items-center rounded-full bg-bone text-ink opacity-0 transition duration-500 ease-[var(--ease-out-expo)] group-hover/artist:translate-y-0 group-hover/artist:opacity-100"
          aria-hidden
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1.5">
        <p className="font-medium">{creator.name}</p>
        {creator.verified && <BadgeCheck className="size-4 shrink-0 text-red" aria-label="Verified artist" />}
      </div>
      <p className="text-sm text-smoke">
        {creator.role} · {creator.location}
      </p>
      <p className="serif-italic mt-3 text-lg leading-snug">&ldquo;{creator.quote}&rdquo;</p>
      <p className="mt-auto pt-4 font-mono text-xs text-smoke">
        <span className="tabular-nums text-ink">{formatCompact(creator.followers)}</span> followers · {creator.genre}
      </p>
    </Link>
  );
}

/** Small card for strips ("More artists"). */
export function ArtistChip({ creator, pieces }: { creator: Creator; pieces: number }) {
  return (
    <Link
      href={`/artists/${creator.handle}`}
      className="group/artist flex w-[62vw] shrink-0 snap-start flex-col sm:w-[38vw] md:w-auto"
    >
      <div className="relative aspect-square overflow-hidden rounded-[22px]">
        <ArtistPortrait
          creator={creator}
          decorative
          sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 62vw"
          className="absolute inset-0"
          imageClassName={HOVER_IMAGE}
          markClassName={HOVER_MARK}
        />
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <p className="truncate font-medium">{creator.name}</p>
        {creator.verified && <BadgeCheck className="size-4 shrink-0 text-red" aria-label="Verified artist" />}
      </div>
      <p className="truncate text-sm text-smoke">
        {creator.genre} · {pieces} {pieces === 1 ? "piece" : "pieces"}
      </p>
    </Link>
  );
}

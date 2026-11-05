import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Creator } from "@/lib/data/creators";
import { ArtistPortrait } from "./artist-portrait";

/** Overlapping round portraits linking to each storefront, plus "Lines by …" credits. */
export function AvatarStack({
  creators,
  tone = "dark",
  label = "Lines by",
  className,
}: {
  creators: Creator[];
  /** The surface it sits on. */
  tone?: "dark" | "light";
  label?: string;
  className?: string;
}) {
  if (creators.length === 0) return null;
  const names = creators.map((c) => c.name);
  const credit =
    names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex -space-x-3">
        {creators.map((c) => (
          <Link
            key={c.handle}
            href={`/artists/${c.handle}`}
            title={c.name}
            className={cn(
              "relative size-11 overflow-hidden rounded-full ring-2 transition hover:z-10 hover:-translate-y-0.5",
              tone === "dark" ? "ring-ink" : "ring-bone",
            )}
          >
            <ArtistPortrait creator={c} sizes="44px" decorative className="absolute inset-0" markSize="w-[70%]" />
            <span className="sr-only">{c.name}</span>
          </Link>
        ))}
      </div>
      <p className={cn("max-w-xs text-sm leading-snug", tone === "dark" ? "text-bone/70" : "text-smoke")}>
        {label} <span className={tone === "dark" ? "text-bone" : "text-ink"}>{credit}</span>
      </p>
    </div>
  );
}

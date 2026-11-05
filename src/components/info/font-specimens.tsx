"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { DESIGN_FONTS, FONT_CATEGORIES, type FontCategory } from "@/lib/fonts";

// One of the shop's own lines per face, so every specimen shows the face doing its job.
const SAMPLES: Record<string, string> = {
  anton: "NO SKIPS",
  "bebas-neue": "ENCORE, ENCORE",
  "archivo-black": "ONE MORE TAKE",
  bricolage: "wear your words",
  bungee: "LOUD HEARTED",
  "instrument-serif": "Liner notes",
  "instrument-serif-italic": "say it back",
  "playfair-black-italic": "Velvet Hours",
  "abril-fatface": "Minor Key",
  "dm-serif-display": "Loud Hearted",
  shrikhand: "heart on the hook",
  monoton: "B-SIDE",
  "rubik-glitch": "STATIC",
  "permanent-marker": "off-key & on purpose",
  caveat: "hum it back to me",
  "rock-salt": "porch light",
  yellowtail: "Midnight in the Mix",
  pacifico: "soft spoken",
  unifraktur: "Basement Tapes",
  "pirata-one": "Pirate Radio",
  "special-elite": "written in the margins",
  "space-mono": "LATE NIGHT FM",
};

type Filter = FontCategory | "All";

/** Sizes a line so it roughly fills the card: wide faces get smaller, short lines bigger. */
function fitSize(text: string, widthFactor: number) {
  const len = Math.max(6, text.length);
  const lines = len > 32 ? 3 : len > 14 ? 2 : 1;
  const perLine = Math.ceil(len / lines);
  const caps = text === text.toUpperCase() && /[A-Z]/.test(text) ? 1.12 : 1;
  return `min(3.25rem, ${(82 / (perLine * widthFactor * caps)).toFixed(2)}cqi)`;
}

export function FontSpecimens() {
  const [line, setLine] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const fonts = useMemo(
    () => (filter === "All" ? DESIGN_FONTS : DESIGN_FONTS.filter((f) => f.category === filter)),
    [filter],
  );
  const typed = line.trim();

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-14 w-full max-w-xl items-center gap-3 rounded-full border border-ink/15 bg-white/50 pl-6 pr-2 transition focus-within:border-ink">
          <span className="sr-only">Type a line to preview it in every typeface</span>
          <input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            maxLength={48}
            placeholder="Type a line to hear every face say it…"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-smoke"
          />
          {line && (
            <button
              type="button"
              onClick={() => setLine("")}
              className="grid size-10 shrink-0 place-items-center rounded-full text-smoke transition hover:bg-ink/6 hover:text-ink"
              aria-label="Reset the samples"
            >
              <RotateCcw className="size-4" />
            </button>
          )}
        </label>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0" role="group" aria-label="Filter typefaces by style">
          {(["All", ...FONT_CATEGORIES] as Filter[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-sm transition-colors",
                filter === c ? "bg-ink text-bone" : "border border-ink/12 hover:border-ink/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {fonts.map((f) => {
          const text = typed || SAMPLES[f.id] || f.label;
          return (
            <li key={f.id} className="flex flex-col rounded-[22px] bg-paper p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow text-smoke">{f.category}</span>
                <span className="font-mono text-[11px] text-smoke">{String(DESIGN_FONTS.indexOf(f) + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex min-h-36 flex-1 items-center py-5 [container-type:inline-size]">
                <p
                  className="line-clamp-3 w-full break-words leading-[1.05]"
                  style={{
                    fontFamily: `"${f.family}"`,
                    fontWeight: f.weight,
                    fontStyle: f.style,
                    fontSize: fitSize(text, f.widthFactor),
                  }}
                >
                  {text}
                </p>
              </div>
              <div className="flex items-end justify-between gap-3 border-t border-ink/10 pt-4">
                <div>
                  <p className="font-medium">{f.label}</p>
                  <p className="font-mono text-[11px] text-smoke">
                    {f.family} · {f.weight}
                    {f.style === "italic" ? " italic" : ""}
                  </p>
                </div>
                <span
                  className="text-3xl leading-none"
                  style={{ fontFamily: `"${f.family}"`, fontWeight: f.weight, fontStyle: f.style }}
                  aria-hidden
                >
                  Aa
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-ink/10 p-5 md:px-7">
        <p className="text-smoke">
          {typed ? (
            <>
              Found the one for <span className="text-ink">&ldquo;{typed}&rdquo;</span>?
            </>
          ) : (
            "Every catalog print and Studio design draws from these faces. Exports embed the exact font files."
          )}
        </p>
        <Link
          href={typed ? `/studio?text=${encodeURIComponent(typed)}` : "/studio"}
          className="group/studio inline-flex items-center gap-2 font-medium"
        >
          {typed ? "Put it on a hoodie" : "Try them in the Studio"}
          <ArrowRight className="size-4 transition group-hover/studio:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

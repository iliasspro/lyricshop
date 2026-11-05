import { X } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Logo, Mark } from "@/components/brand/logo";

type Dont = { title: string; body: string; art: ReactNode; surface?: string };

const lockup = (style: CSSProperties, tone: "ink" | "bone" = "ink") => (
  <div className="w-[64%]" style={style}>
    <Logo tone={tone} className="h-auto w-full" />
  </div>
);

const DONTS: Dont[] = [
  {
    title: "Don't stretch it.",
    body: "Scale it in proportion, or not at all.",
    art: lockup({ transform: "scale(1.42, 0.68)" }),
  },
  {
    title: "Don't tilt it.",
    body: "It sits level on the baseline, like a record on the platter.",
    art: lockup({ transform: "rotate(-14deg)" }),
  },
  {
    title: "Don't flip the mark.",
    body: "It's an opening quote. The words come after it, not before.",
    art: (
      <div className="w-[34%]" style={{ transform: "scaleX(-1)" }}>
        <Mark className="h-auto w-full" />
      </div>
    ),
  },
  {
    title: "Don't recolor the light.",
    body: "The on-air dot is On-Air Red, every time, on every background.",
    art: lockup({ filter: "hue-rotate(160deg) saturate(1.4)" }),
  },
  {
    title: "No shadows or glows.",
    body: "No bevels, outlines or stickers on the logo itself. Flat, always.",
    art: lockup({ filter: "drop-shadow(4px 5px 0 #FF4A1C) drop-shadow(0 14px 16px rgba(15,14,13,.35))" }),
  },
  {
    title: "Don't whisper it.",
    body: "Bone on paper disappears. If you squint and it's gone, it's wrong.",
    art: lockup({}, "bone"),
  },
  {
    title: "Don't bury it in a photo.",
    body: "Give it a calm patch of image, or put it on a solid field.",
    surface: "bg-ink",
    art: (
      <>
        <Image src="/images/store-interior.jpg" alt="" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
        <div className="relative w-[64%]">
          <Logo className="h-auto w-full" />
        </div>
      </>
    ),
  },
  {
    title: "Don't retype it.",
    body: "The wordmark is drawn, not typed. Use the files, never a font.",
    art: (
      <span className="text-[clamp(2rem,3.6vw,2.9rem)] leading-none" style={{ fontFamily: '"ls-pacifico"' }}>
        lyricshop
      </span>
    ),
  },
];

/** Logo misuse examples, each faked with a CSS transform, filter or swap. */
export function BrandMisuse() {
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5">
      {DONTS.map((d) => (
        <li key={d.title}>
          <figure>
            <div className={`relative isolate grid aspect-[4/3] place-items-center overflow-hidden rounded-[22px] ${d.surface ?? "bg-paper"}`}>
              {d.art}
              <span className="absolute left-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-red text-ink shadow-[0_6px_16px_-6px_rgba(255,74,28,.9)]">
                <X className="size-4" strokeWidth={2.6} aria-hidden />
              </span>
            </div>
            <figcaption className="mt-4 px-1">
              <p className="font-medium">{d.title}</p>
              <p className="mt-1 text-sm text-smoke">{d.body}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

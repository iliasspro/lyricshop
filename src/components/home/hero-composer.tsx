"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { Swatch } from "@/components/ui/bits";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { text, type Layer } from "@/lib/design";
import { fitLyric } from "@/lib/fit";
import { GARMENTS } from "@/lib/garments";

const STYLES = [
  { id: "anton", label: "Loud", upper: true },
  { id: "dm-serif-display", label: "Serif", upper: false },
  { id: "caveat", label: "Pen", upper: false },
  { id: "permanent-marker", label: "Marker", upper: false },
  { id: "unifraktur", label: "Gothic", upper: false },
  { id: "monoton", label: "Neon", upper: false },
] as const;

const COLORS = ["black", "bone", "red", "sage", "lilac", "navy"];

const DEMO = [
  { line: "loud hearted", style: 1, color: "black" },
  { line: "no skips", style: 0, color: "red" },
  { line: "hum it back to me", style: 2, color: "bone" },
  { line: "off-key on purpose", style: 3, color: "sage" },
  { line: "after midnight", style: 4, color: "black" },
  { line: "static & soft light", style: 5, color: "navy" },
];

const INK_FOR: Record<string, string> = {
  black: "#F3EEE5",
  bone: "#161515",
  red: "#161515",
  sage: "#161515",
  lilac: "#161515",
  navy: "#FF4A1C",
};

export function HeroComposer() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [styleIdx, setStyleIdx] = useState(1);
  const [colorId, setColorId] = useState("black");
  const [demo, setDemo] = useState({ i: 0, chars: 0, deleting: false });
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter demo until the visitor starts typing.
  useEffect(() => {
    if (touched) return;
    const current = DEMO[demo.i];
    const full = current.line;
    const done = demo.chars === full.length;
    const delay = demo.deleting ? 28 : done ? 1900 : 70 + Math.random() * 60;
    const timer = setTimeout(() => {
      if (!demo.deleting && !done) setDemo({ ...demo, chars: demo.chars + 1 });
      else if (!demo.deleting && done) setDemo({ ...demo, deleting: true });
      else if (demo.deleting && demo.chars > 0) setDemo({ ...demo, chars: demo.chars - 1 });
      else {
        const next = (demo.i + 1) % DEMO.length;
        setStyleIdx(DEMO[next].style);
        setColorId(DEMO[next].color);
        setDemo({ i: next, chars: 0, deleting: false });
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [demo, touched]);

  const line = touched ? value : DEMO[demo.i].line.slice(0, demo.chars);
  const style = STYLES[styleIdx];
  const garment = GARMENTS.hoodie;
  const area = garment.views.front!.printArea;

  const layers = useMemo<Layer[]>(() => {
    if (!line.trim()) return [];
    const fitted = fitLyric(line, style.id, { aspect: area.h / area.w, uppercase: style.upper, maxSize: 0.3 });
    return [
      text({
        id: "hero-line",
        text: fitted.text,
        font: style.id,
        size: fitted.size,
        y: 0.56,
        uppercase: style.upper,
        lineHeight: style.upper ? 0.9 : 1,
        color: INK_FOR[colorId] ?? "#F3EEE5",
      }),
    ];
  }, [line, style, colorId, area.h, area.w]);

  const goStudio = () => {
    const t = (touched ? value : DEMO[demo.i].line).trim();
    const params = new URLSearchParams({ garment: "hoodie", color: colorId, font: style.id });
    if (t) params.set("text", t);
    router.push(`/studio?${params}`);
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
      <div className="relative z-10">
        <p className="eyebrow inline-flex animate-rise items-center gap-2 rounded-full border border-ink/12 px-3 py-1.5 text-smoke">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-red" /> The Loud Hearted drop is live
        </p>

        <h1 className="display mt-7 text-[clamp(3.6rem,9.4vw,9.6rem)]">
          <span className="block animate-rise [animation-delay:60ms]">Wear your</span>
          <span className="serif-italic block animate-rise pl-[0.04em] text-[1.14em] leading-[0.82] text-red [animation-delay:160ms]">
            words.
          </span>
        </h1>

        <p className="mt-7 max-w-xl animate-rise text-lg leading-relaxed text-smoke [animation-delay:280ms] md:text-xl">
          The marketplace for lyric-driven streetwear from independent artists. Or type the line stuck in your head, and we&apos;ll
          print it on a heavyweight hoodie.
        </p>

        <div className="mt-9 max-w-xl animate-rise rounded-[28px] bg-white/60 p-2 shadow-[0_20px_60px_-30px_rgba(15,14,13,.45)] ring-1 ring-ink/8 backdrop-blur [animation-delay:400ms]">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              goStudio();
            }}
          >
            <label htmlFor="hero-line" className="sr-only">
              Your line
            </label>
            <input
              id="hero-line"
              ref={inputRef}
              value={touched ? value : ""}
              placeholder={touched ? "Type a line you can't stop singing…" : `${DEMO[demo.i].line.slice(0, demo.chars)}`}
              onFocus={() => {
                if (!touched) {
                  setTouched(true);
                  setValue("");
                }
              }}
              onChange={(e) => {
                setTouched(true);
                setValue(e.target.value.slice(0, 60));
              }}
              className={cn(
                "h-14 min-w-0 flex-1 bg-transparent pl-4 text-lg outline-none md:text-xl",
                touched ? "placeholder:text-smoke/70" : "placeholder:text-ink",
              )}
              autoComplete="off"
            />
            <button
              type="submit"
              className="flex h-14 shrink-0 items-center gap-2 rounded-[22px] bg-ink px-5 font-medium text-bone transition hover:bg-red hover:text-ink"
            >
              <Sparkles className="size-4" />
              <span className="max-sm:hidden">Make it real</span>
              <ArrowRight className="size-4" />
            </button>
          </form>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
            <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Lettering style">
              {STYLES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={styleIdx === i}
                  onClick={() => {
                    setTouched(true);
                    if (!touched) setValue(DEMO[demo.i].line);
                    setStyleIdx(i);
                  }}
                  className={cn(
                    "h-8 rounded-full px-3 text-[13px] transition",
                    styleIdx === i ? "bg-ink text-bone" : "hover:bg-ink/8",
                  )}
                  style={{ fontFamily: `"ls-${s.id}"` }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Hoodie color">
              {COLORS.map((id) => {
                const c = colorFor(id);
                return (
                  <Swatch
                    key={id}
                    hex={c.hex}
                    label={c.name}
                    size="sm"
                    selected={colorId === id}
                    onClick={() => {
                      setTouched(true);
                      if (!touched) setValue(DEMO[demo.i].line);
                      setColorId(id);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-4 pl-2 text-sm text-smoke">
          From $64 · printed to order in 3 days · free returns on Studio pieces that don&apos;t fit
        </p>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[640px] animate-rise [animation-delay:120ms]">
        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_45%,#ffffff_0%,#efe8dc_45%,transparent_70%)]" />
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow opacity-[0.55]" aria-hidden>
          {[96, 88, 80, 72, 64].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#0f0e0d" strokeOpacity={0.07} strokeWidth="0.4" />
          ))}
          <defs>
            <path id="hero-ring" d="M100 100m-91 0a91 91 0 1 1 182 0a91 91 0 1 1 -182 0" />
          </defs>
          <text fontSize="5.2" letterSpacing="2.4" className="font-mono uppercase" fill="#0f0e0d" fillOpacity="0.55">
            <textPath href="#hero-ring">
              your words · our heavyweight blanks · printed in three days · artists keep 30% ·
            </textPath>
          </text>
        </svg>
        <motion.div
          className="absolute inset-[4%]"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={colorId}
              className="h-full w-full"
              initial={{ opacity: 0.4, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              <GarmentMockup garment="hoodie" color={colorFor(colorId).hex} layers={layers} className="h-full w-full drop-shadow-2xl" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="absolute bottom-[10%] right-[2%] rotate-[8deg] rounded-2xl bg-ink px-4 py-3 text-bone shadow-xl">
          <p className="eyebrow !text-[10px] text-bone/50">Live preview</p>
          <p className="font-mono text-sm">Heavyweight Hoodie · $64</p>
        </div>
      </div>
    </div>
  );
}

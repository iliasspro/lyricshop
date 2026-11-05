"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Image as ImageIcon, Sparkles, Type, Wand2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { graphic, text } from "@/lib/design";

const FRAMES = [
  { font: "anton", label: "Anton", color: "#161515", cloth: "#EFE8DB", g: "bolt", upper: true },
  { font: "yellowtail", label: "Yellowtail", color: "#F3EEE5", cloth: "#5A1D29", g: "sparkle", upper: false },
  { font: "unifraktur", label: "Unifraktur", color: "#FF4A1C", cloth: "#161515", g: "vinyl", upper: false },
  { font: "permanent-marker", label: "Marker", color: "#161515", cloth: "#A3AE95", g: "heart", upper: false },
];

export function StudioTeaser() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 2400);
    return () => clearInterval(t);
  }, []);
  const f = FRAMES[i];
  const layers = [
    text({ id: "st-t", text: "your words\nhere", font: f.font, size: f.upper ? 0.2 : 0.17, y: 0.36, color: f.color, uppercase: f.upper, lineHeight: 0.95 }),
    graphic({ id: "st-g", graphic: f.g, size: 0.2, y: 0.76, color: "#FF4A1C" }),
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      <div className="relative overflow-hidden rounded-[32px]">
        <Image
          src="/images/studio-flatlay.jpg"
          alt="A t-shirt being screen printed with the words Wear Your Words"
          width={1376}
          height={768}
          className="h-full min-h-[440px] w-full object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4 md:bottom-8 md:left-8">
          <div className="relative size-40 shrink-0 rounded-3xl bg-bone/95 p-2 shadow-2xl backdrop-blur md:size-52">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full"
              >
                <GarmentMockup garment="tee" color={f.cloth} layers={layers} shadow={false} className="h-full w-full" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mb-1 hidden flex-col gap-2 sm:flex">
            {FRAMES.map((fr, n) => (
              <span
                key={fr.font}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm backdrop-blur transition-all duration-500",
                  n === i ? "bg-red text-ink" : "bg-ink/50 text-bone/70",
                )}
                style={{ fontFamily: `"ls-${fr.font}"` }}
              >
                {fr.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="eyebrow inline-flex items-center gap-2 text-bone/50">
          <Sparkles className="size-3.5 text-red" /> The Lyricshop Studio
        </p>
        <h2 className="display mt-5 text-[clamp(2.6rem,5.4vw,5rem)]">
          The line in your head, <span className="serif-italic font-normal text-red">on your chest</span> by Friday.
        </h2>
        <p className="mt-6 max-w-lg text-lg text-bone/65">
          Pick a blank, type your words and play with 22 typefaces, curved text and a whole sticker sheet. Then generate a one-off graphic
          with Nano Banana Pro. We print it to order and ship it in three days.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Type, title: "Write it", body: "22 typefaces, arcs, outlines" },
            { icon: Wand2, title: "Generate it", body: "AI graphics with Nano Banana Pro" },
            { icon: ImageIcon, title: "Wear it", body: "See it on a model before you buy" },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-bone/12 p-5">
              <Icon className="size-5 text-red" />
              <p className="mt-4 font-medium">{title}</p>
              <p className="mt-1 text-sm text-bone/55">{body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/studio" variant="accent" size="lg">
            Open the Studio <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink href="/studio?garment=tote" variant="outline-bone" size="lg">
            Start with a tote
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

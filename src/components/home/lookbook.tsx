"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { colorFor } from "@/lib/colors";
import { getProduct } from "@/lib/data/products";
import { formatPrice } from "@/lib/pricing";

const LOOKS = [
  { image: "/images/lookbook-say-it-back.jpg", slug: "say-it-back-hoodie", spot: { x: 50, y: 42 }, caption: "Record store, Saturday" },
  { image: "/images/lookbook-b-side.jpg", slug: "b-side-hoodie", spot: { x: 47, y: 58 }, caption: "Spin cycle" },
  { image: "/images/lookbook-liner-notes.jpg", slug: "liner-notes-tee", spot: { x: 56, y: 60 }, caption: "The last train home" },
];

export function Lookbook() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-5">
      {LOOKS.map((look, i) => {
        const product = getProduct(look.slug)!;
        return (
          <figure key={look.slug} className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-6" : ""}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[28px]">
              <Image
                src={look.image}
                alt={`${product.title} lookbook photo`}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition duration-[1.2s] ease-[var(--ease-out-expo)] hover:scale-[1.03]"
              />
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-bone text-ink shadow-xl transition hover:scale-110"
                style={{ left: `${look.spot.x}%`, top: `${look.spot.y}%` }}
                aria-label={`Show ${product.title}`}
                aria-expanded={open === i}
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-bone/60" />
                <Plus className={`relative size-5 transition ${open === i ? "rotate-45" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-4 bottom-4"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex items-center gap-3 rounded-2xl bg-bone p-2.5 pr-4 shadow-2xl"
                    >
                      <span className="size-16 shrink-0 rounded-xl bg-[#e5ddcf] p-1">
                        <GarmentMockup
                          garment={product.garment}
                          color={colorFor(product.colors[0]).hex}
                          layers={product.design.front}
                          shadow={false}
                          className="h-full w-full"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{product.title}</span>
                        <span className="font-mono text-sm text-smoke">{formatPrice(product.price)}</span>
                      </span>
                      <span className="text-sm underline underline-offset-4">Shop</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <figcaption className="mt-3 flex justify-between px-1 text-sm text-smoke">
              <span className="serif-italic text-lg text-ink">{look.caption}</span>
              <span className="font-mono">0{i + 1}</span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

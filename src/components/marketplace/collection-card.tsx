import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import type { Collection } from "@/lib/data/collections";
import type { Product } from "@/lib/data/products";

const IMAGE_HOVER = "transition duration-[1.2s] ease-[var(--ease-out-expo)]";

/** Big photo card for the collections index: number, title, tagline and a peek at the pieces. */
export function CollectionFeatureCard({
  collection: c,
  index,
  total,
  products,
  className,
}: {
  collection: Collection;
  index: number;
  total: number;
  products: Product[];
  className?: string;
}) {
  const preview = products.slice(0, 3);
  return (
    <Link
      href={`/collections/${c.slug}`}
      className={cn("group/col relative isolate flex aspect-[4/5] overflow-hidden rounded-[32px] bg-ink text-bone", className)}
    >
      <Image
        src={c.image}
        alt=""
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className={cn("-z-10 object-cover group-hover/col:scale-105", IMAGE_HOVER)}
        style={{ objectPosition: c.focus }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/10" />

      <div className="flex w-full flex-col justify-between p-6 md:p-9">
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow flex items-center gap-2 text-bone/75">
            <span className="size-1.5 rounded-full" style={{ background: c.accent }} />
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <span className="eyebrow rounded-full bg-bone/15 px-3 py-1.5 tabular-nums backdrop-blur">
            {products.length} pieces
          </span>
        </div>

        <div>
          <h2 className="display text-[clamp(2.6rem,5.2vw,4.8rem)]">{c.title}</h2>
          <p className="serif-italic mt-2 text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight text-bone/90">{c.tagline}</p>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-bone/70 max-sm:hidden">{c.description}</p>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div className="flex -space-x-3" aria-hidden>
              {preview.map((p, i) => (
                <span
                  key={p.slug}
                  className="size-14 rounded-2xl bg-bone p-1 shadow-lg ring-2 ring-ink/30 transition duration-500 ease-[var(--ease-out-expo)] group-hover/col:-translate-y-1 md:size-16"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <GarmentMockup
                    garment={p.garment}
                    color={colorFor(p.colors[0]).hex}
                    layers={p.design.front}
                    shadow={false}
                    className="h-full w-full"
                  />
                </span>
              ))}
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-bone/15 px-4 py-2 text-sm backdrop-blur transition group-hover/col:bg-bone group-hover/col:text-ink">
              Explore <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Compact card for the "other collections" strip. */
export function CollectionMiniCard({ collection: c, count }: { collection: Collection; count: number }) {
  return (
    <Link
      href={`/collections/${c.slug}`}
      className="group/col relative isolate flex aspect-[4/5] w-[72vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-ink text-bone sm:w-[44vw] md:w-auto"
    >
      <Image
        src={c.image}
        alt=""
        fill
        sizes="(min-width: 768px) 33vw, 72vw"
        className={cn("-z-10 object-cover group-hover/col:scale-105", IMAGE_HOVER)}
        style={{ objectPosition: c.focus }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
      <div className="flex w-full flex-col justify-end p-6">
        <p className="eyebrow text-bone/65">{count} pieces</p>
        <p className="display mt-2 text-[clamp(2rem,3vw,2.8rem)]">{c.title}</p>
        <p className="mt-1 text-bone/75">{c.tagline}</p>
        <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-bone/15 px-4 py-2 text-sm backdrop-blur transition group-hover/col:bg-bone group-hover/col:text-ink">
          Explore <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

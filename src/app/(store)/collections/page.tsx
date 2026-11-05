import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { CollectionFeatureCard } from "@/components/marketplace/collection-card";
import { Eyebrow } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { COLLECTIONS } from "@/lib/data/collections";
import { productsInCollection } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Four moods of lyric-driven streetwear: Lyricshop Originals, Night Shift, Paper Hearts and Basement Tapes. Lines by independent artists, printed to order.",
};

export default function CollectionsPage() {
  const collections = COLLECTIONS.map((c) => ({ collection: c, products: productsInCollection(c.slug) }));
  const pieces = collections.reduce((n, c) => n + c.products.length, 0);

  return (
    <>
      <section className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8">
          <div>
            <Eyebrow dot className="text-smoke">
              Collections · {COLLECTIONS.length} moods · {pieces} pieces
            </Eyebrow>
            <h1 className="display mt-5 text-[clamp(3rem,7vw,6.5rem)]">
              Pick a <span className="serif-italic font-normal text-red">mood.</span>
            </h1>
          </div>
          <p className="max-w-sm text-smoke">
            Each collection is a set of lines that belong on the same playlist. Some are loud, some are written in pencil. All of
            them are printed to order.
          </p>
        </div>
      </section>

      <section className="container-page pb-24 md:pb-44">
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {collections.map(({ collection, products }, i) => (
            <CollectionFeatureCard
              key={collection.slug}
              collection={collection}
              products={products}
              index={i}
              total={collections.length}
              className={cn(i % 2 === 1 && "md:translate-y-24")}
            />
          ))}
        </div>
      </section>

      <section className="container-page pb-24 md:pb-32">
        <div className="grain relative overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-bone md:px-14 md:py-20">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-10">
            <div className="max-w-2xl">
              <p className="eyebrow text-bone/50">Not your mood?</p>
              <p className="display mt-5 text-[clamp(2.4rem,5vw,4.6rem)]">
                Write the line <span className="serif-italic font-normal text-red">yourself.</span>
              </p>
              <p className="mt-5 max-w-lg text-lg text-bone/65">
                Type it in the Studio, pick a typeface and a blank, and we&rsquo;ll print a one-off just for you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/studio" variant="accent" size="lg">
                Open the Studio <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/artists" variant="outline-bone" size="lg">
                Meet the artists
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

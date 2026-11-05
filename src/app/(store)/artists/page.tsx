import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArtistCard } from "@/components/marketplace/artist-card";
import { Eyebrow } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { CREATORS } from "@/lib/data/creators";
import { productsByCreator } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "Meet the independent songwriters, producers and poets behind every Lyricshop piece. Each artist keeps 30% of every sale.",
};

const CARD_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

export default function ArtistsPage() {
  const artists = CREATORS.map((creator) => ({ creator, pieces: productsByCreator(creator.handle).length }));
  const people = CREATORS.filter((c) => c.avatar).length;

  return (
    <>
      <section className="container-page pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8">
          <div>
            <Eyebrow dot className="text-smoke">
              The artists · {people} writers + the house line
            </Eyebrow>
            <h1 className="display mt-5 text-[clamp(3rem,7vw,6.5rem)]">
              The people behind <span className="serif-italic font-normal text-red">the lines.</span>
            </h1>
          </div>
          <p className="max-w-sm text-smoke">
            Every piece in the shop starts in someone&rsquo;s notebook. Follow the writers you love, shop their storefronts, and know
            that 30% of every sale goes straight back to them.
          </p>
        </div>
      </section>

      <section className="container-page pb-24 md:pb-32">
        <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map(({ creator, pieces }) => (
            <ArtistCard key={creator.handle} creator={creator} pieces={pieces} sizes={CARD_SIZES} />
          ))}
          <OpenSpot />
        </div>
      </section>

      <section className="bg-paper py-24 md:py-32">
        <div className="container-page grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow text-smoke">How artists get paid</p>
            <p className="display mt-5 text-[clamp(2.4rem,5vw,4.6rem)]">
              Every piece pays the person <span className="serif-italic font-normal">who wrote it.</span>
            </p>
          </div>
          <div className="lg:col-span-5">
            <dl className="grid grid-cols-3 gap-6 border-t border-ink/15 pt-6">
              {[
                ["30%", "of every sale to the artist"],
                ["Monthly", "payouts on the 1st"],
                ["0", "boxes of unsold stock"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-2 text-sm text-smoke">{label}</dt>
                  <dd className="display text-[clamp(1.8rem,3vw,2.6rem)]">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/sell" size="lg">
                Sell with us <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/shop" variant="outline" size="lg">
                Shop every piece
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** The empty slot at the end of the directory: an invitation to sell. */
function OpenSpot() {
  return (
    <Link href="/sell" className="group/open flex flex-col">
      <div className="relative grid aspect-[3/4] place-items-center rounded-[24px] border-2 border-dashed border-ink/20 transition duration-500 group-hover/open:border-red group-hover/open:bg-red/5">
        <span className="grid size-16 place-items-center rounded-full bg-ink text-bone transition duration-500 ease-[var(--ease-out-expo)] group-hover/open:scale-110 group-hover/open:bg-red group-hover/open:text-ink">
          <Plus className="size-6" />
        </span>
        <span className="eyebrow absolute inset-x-0 bottom-5 text-center text-smoke">This spot&rsquo;s open</span>
      </div>
      <p className="mt-4 font-medium">Your name here</p>
      <p className="text-sm text-smoke">Songwriter · Anywhere</p>
      <p className="serif-italic mt-3 text-lg leading-snug">&ldquo;Write the line. We&rsquo;ll print the rest.&rdquo;</p>
      <p className="mt-auto inline-flex items-center gap-1 pt-4 font-mono text-xs text-smoke">
        <span className="text-ink">Sell with us</span>
        <ArrowUpRight className="size-3.5 transition group-hover/open:-translate-y-0.5 group-hover/open:translate-x-0.5" />
      </p>
    </Link>
  );
}

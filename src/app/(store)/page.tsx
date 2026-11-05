import { ArrowRight, ArrowUpRight, BadgeCheck, Leaf, Package, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeroComposer } from "@/components/home/hero-composer";
import { Lookbook } from "@/components/home/lookbook";
import { ProductRail } from "@/components/home/product-rail";
import { StudioTeaser } from "@/components/home/studio-teaser";
import { Eyebrow, SectionHeading } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { COLLECTION_BY_SLUG } from "@/lib/data/collections";
import { CREATORS } from "@/lib/data/creators";
import { productsByCreator, productsInCollection } from "@/lib/data/products";

const LINES = [
  { t: "loud hearted", f: "ls-dm-serif-display" },
  { t: "NO SKIPS", f: "ls-anton" },
  { t: "hum it back to me", f: "ls-caveat" },
  { t: "ONE MORE TAKE", f: "ls-archivo-black" },
  { t: "Velvet Hours", f: "ls-yellowtail" },
  { t: "say it back", f: "ls-instrument-serif-italic" },
  { t: "off-key & on purpose", f: "ls-permanent-marker" },
  { t: "Basement Tapes", f: "ls-unifraktur" },
];

export default function HomePage() {
  const artists = CREATORS.filter((c) => c.avatar);
  return (
    <>
      <section className="container-page overflow-hidden pb-16 pt-8 md:pb-24 md:pt-14">
        <HeroComposer />
      </section>

      {/* Lyric marquee */}
      <section className="overflow-hidden bg-ink py-8 text-bone md:py-10" aria-label="Lines from the shop">
        <Marquee duration={60}>
          {LINES.map((l) => (
            <span key={l.t} className="flex items-center gap-10 px-5 text-[clamp(2.8rem,7vw,6.5rem)] leading-none" style={{ fontFamily: l.f }}>
              {l.t}
              <RecordDot />
            </span>
          ))}
        </Marquee>
        <Marquee duration={70} reverse className="mt-3 opacity-40">
          {[...LINES].reverse().map((l) => (
            <span key={l.t} className="flex items-center gap-8 px-4 text-[clamp(1.4rem,3vw,2.6rem)] leading-none" style={{ fontFamily: l.f }}>
              {l.t}
              <span className="size-2 rounded-full bg-red" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* Campaign */}
      <section className="relative isolate overflow-hidden bg-ink text-bone">
        <div className="relative h-[78vh] min-h-[560px] w-full">
          <Image
            src="/images/campaign-rooftop.jpg"
            alt="Three friends on a city rooftop at blue hour wearing Lyricshop pieces"
            fill
            priority={false}
            sizes="100vw"
            className="object-cover object-[70%_50%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent md:via-ink/25" />
          <div className="container-page relative flex h-full flex-col justify-end pb-14 md:justify-center md:pb-0">
            <Eyebrow dot className="text-bone/70">
              Fall &rsquo;26 campaign
            </Eyebrow>
            <h2 className="display mt-5 max-w-xl text-[clamp(3.2rem,8vw,8rem)]">
              Loud <span className="serif-italic font-normal">hearted.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-bone/75">
              Shot on a rooftop at blue hour with the people who wear it best. Heavy fleece and a serif that feels everything.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/product/loud-hearted-hoodie" variant="bone" size="lg">
                Shop the hoodie <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/collections/originals" variant="outline-bone" size="lg">
                The Originals
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading
          eyebrow="The shop"
          title={
            <>
              Lines worth <span className="serif-italic font-normal">repeating</span>
            </>
          }
          className="mb-10"
        />
        <ProductRail />
      </section>

      {/* Collections */}
      <section className="container-page pb-24 md:pb-32">
        <SectionHeading
          eyebrow="Collections"
          title="Pick a mood."
          aside={
            <Link href="/collections" className="group/all inline-flex items-center gap-2 font-medium">
              All collections <ArrowRight className="size-4 transition group-hover/all:translate-x-1" />
            </Link>
          }
          className="mb-10"
        />
        <div className="grid gap-4 md:grid-cols-12 md:grid-rows-2 md:gap-5">
          {(["night-shift", "paper-hearts", "basement-tapes"] as const).map((slug, i) => {
            const c = COLLECTION_BY_SLUG[slug];
            const count = productsInCollection(slug).length;
            return (
              <Link
                key={slug}
                href={`/collections/${slug}`}
                className={`group/col relative isolate overflow-hidden rounded-[28px] ${
                  i === 0 ? "aspect-[4/5] md:col-span-5 md:row-span-2 md:aspect-auto" : "aspect-[16/10] md:col-span-7 md:aspect-auto md:min-h-[300px]"
                }`}
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="-z-10 object-cover transition duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/col:scale-105"
                  style={{ objectPosition: c.focus }}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="flex h-full flex-col justify-end p-6 text-bone md:p-8">
                  <p className="eyebrow text-bone/60">
                    {count} pieces · {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="display mt-2 text-[clamp(2.2rem,4vw,3.6rem)]">{c.title}</p>
                  <p className="mt-1 max-w-sm text-bone/75">{c.tagline}</p>
                  <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-bone/15 px-4 py-2 text-sm backdrop-blur transition group-hover/col:bg-bone group-hover/col:text-ink">
                    Explore <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Studio */}
      <section className="grain bg-ink py-24 text-bone md:py-32">
        <div className="container-page relative z-10">
          <StudioTeaser />
        </div>
      </section>

      {/* Artists */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading
          eyebrow="The artists"
          title={
            <>
              Real songwriters. <span className="serif-italic font-normal">Real</span> royalties.
            </>
          }
          aside={
            <p className="max-w-sm text-smoke">
              Every piece is a line by an independent artist. They keep 30% of every sale, paid out monthly.
            </p>
          }
          className="mb-12"
        />
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:grid-cols-6">
          {artists.map((a) => (
            <Link
              key={a.handle}
              href={`/artists/${a.handle}`}
              className="group/artist w-[70vw] shrink-0 snap-start sm:w-[42vw] md:w-auto"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-paper">
                <Image
                  src={a.avatar!}
                  alt={`${a.name}, ${a.role}`}
                  fill
                  sizes="(min-width: 1280px) 16vw, (min-width: 768px) 33vw, 70vw"
                  className="object-cover grayscale-[35%] transition duration-700 group-hover/artist:scale-105 group-hover/artist:grayscale-0"
                />
                <span className="absolute left-3 top-3 rounded-full bg-bone/85 px-2.5 py-1 font-mono text-[11px] backdrop-blur">
                  {productsByCreator(a.handle).length} pieces
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                <p className="font-medium">{a.name}</p>
                {a.verified && <BadgeCheck className="size-4 text-red" aria-label="Verified artist" />}
              </div>
              <p className="text-sm text-smoke">
                {a.genre} · {a.location}
              </p>
              <p className="serif-italic mt-3 text-lg leading-snug">&ldquo;{a.quote}&rdquo;</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Lookbook */}
      <section className="bg-paper py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            eyebrow="Lookbook"
            title={
              <>
                Worn out <span className="serif-italic font-normal">loud</span>
              </>
            }
            aside={<p className="max-w-xs text-smoke">Tap the markers to shop what you see.</p>}
            className="mb-12"
          />
          <Lookbook />
        </div>
      </section>

      {/* Community */}
      <section className="relative isolate overflow-hidden bg-ink text-bone">
        <div className="relative min-h-[620px]">
          <Image src="/images/crowd.jpg" alt="A crowd singing along at a small venue" fill sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
          <div className="container-page flex min-h-[620px] flex-col justify-end pb-16">
            <p className="display max-w-4xl text-[clamp(3rem,8vw,7.5rem)]">
              The chorus <span className="serif-italic font-normal text-red">is us.</span>
            </p>
            <div className="mt-10 grid max-w-4xl gap-6 border-t border-bone/15 pt-8 sm:grid-cols-3">
              {[
                ["30%", "of every sale goes to the artist who wrote the line"],
                ["3 days", "from your order to a printed, packed piece"],
                ["100%", "organic cotton blanks, printed to order, no deadstock"],
              ].map(([n, label]) => (
                <div key={n}>
                  <p className="display text-5xl">{n}</p>
                  <p className="mt-2 text-sm text-bone/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page grid gap-px overflow-hidden py-16 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Leaf, title: "Heavyweight organic", body: "240–450 gsm organic cotton, garment dyed." },
          { icon: Package, title: "Printed to order", body: "No warehouses of unsold stock. Shipped in 3 days." },
          { icon: RefreshCw, title: "30-day returns", body: "Free exchanges on catalog pieces, easy returns." },
          { icon: BadgeCheck, title: "Artist-owned lines", body: "Every design is licensed from the artist who wrote it." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4 p-6">
            <Icon className="mt-0.5 size-5 shrink-0 text-red" />
            <div>
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-sm text-smoke">{body}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function RecordDot() {
  return (
    <svg viewBox="0 0 40 40" className="size-[0.5em] shrink-0" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#F3EEE5" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#0f0e0d" strokeOpacity=".25" />
      <circle cx="20" cy="20" r="10" fill="none" stroke="#0f0e0d" strokeOpacity=".25" />
      <circle cx="20" cy="20" r="7" fill="#FF4A1C" />
      <circle cx="20" cy="20" r="1.4" fill="#0f0e0d" />
    </svg>
  );
}

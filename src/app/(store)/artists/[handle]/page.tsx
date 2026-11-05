import { ArrowDown, ArrowRight, BadgeCheck, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Mark } from "@/components/brand/logo";
import { ArtistChip } from "@/components/marketplace/artist-card";
import { ArtistPortrait } from "@/components/marketplace/artist-portrait";
import { FollowButton } from "@/components/marketplace/follow-button";
import { formatCompact } from "@/components/marketplace/format";
import { ArtistSkeleton } from "@/components/marketplace/skeletons";
import { ProductCard } from "@/components/product/product-card";
import { Eyebrow, SectionHeading } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { COLLECTION_BY_SLUG, type Collection } from "@/lib/data/collections";
import { CREATORS, getCreator } from "@/lib/data/creators";
import { productsByCreator } from "@/lib/data/products";

export function generateStaticParams() {
  return CREATORS.map((c) => ({ handle: c.handle }));
}

/** Handles can contain dots ("rumi.loops"); tolerate an encoded segment and malformed escapes. */
function findArtist(raw: string) {
  let handle = raw;
  try {
    handle = decodeURIComponent(raw);
  } catch {
    // keep the raw segment
  }
  return getCreator(handle);
}

export async function generateMetadata({ params }: PageProps<"/artists/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const artist = findArtist(handle);
  if (!artist) return { title: "Artist not found" };
  return {
    title: artist.name,
    description: `${artist.role} · ${artist.genre} · ${artist.location}. ${artist.bio}`,
    openGraph: {
      title: `${artist.name} · Lyricshop`,
      description: artist.quote,
      images: artist.avatar ? [{ url: artist.avatar }] : undefined,
    },
  };
}

// The page itself never awaits params: the handle is URL data, so it's read inside Suspense
// and client navigations between storefronts can show the skeleton instantly.
export default function ArtistPage({ params }: PageProps<"/artists/[handle]">) {
  return (
    <Suspense fallback={<ArtistSkeleton />}>
      <ArtistContent params={params} />
    </Suspense>
  );
}

async function ArtistContent({ params }: Pick<PageProps<"/artists/[handle]">, "params">) {
  const { handle } = await params;
  const artist = findArtist(handle);
  if (!artist) notFound();

  const pieces = productsByCreator(artist.handle);
  const collections = [...new Set(pieces.map((p) => p.collection))]
    .map((slug) => COLLECTION_BY_SLUG[slug])
    .filter((c): c is Collection => !!c);
  const others = CREATORS.filter((c) => c.handle !== artist.handle);
  const isHouse = !artist.avatar;
  const shortName = isHouse ? artist.name : artist.name.split(" ")[0];

  const stats = [
    { label: pieces.length === 1 ? "Piece" : "Pieces", value: String(pieces.length) },
    { label: "Followers", value: formatCompact(artist.followers) },
    { label: "On Lyricshop since", value: artist.joined },
  ];
  const links = artist.links.filter((l) => l.href && l.href !== "#");

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-ink text-bone">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-48 -top-40 size-[720px] rounded-full opacity-25 blur-[120px]"
          style={{ background: artist.accent }}
        />
        <p
          aria-hidden
          className="display pointer-events-none absolute -bottom-[0.18em] right-[-0.04em] select-none whitespace-nowrap text-[17vw] text-bone/[0.045]"
        >
          @{artist.handle}
        </p>

        <div className="container-page relative z-10 pb-16 pt-6 md:pb-24">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-bone/60">
              <li>
                <Link href="/artists" className="link-underline hover:text-bone">
                  Artists
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li aria-current="page" className="text-bone">
                {artist.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-16">
            <ArtistPortrait
              creator={artist}
              preload
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="relative aspect-[4/5] w-full max-w-[520px] rounded-[28px] ring-1 ring-bone/10"
              markSize="w-[52%] max-w-64"
            />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow dot className="text-bone/60">
                  {isHouse ? "House line" : "Artist storefront"}
                </Eyebrow>
                {artist.verified && (
                  <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-bone/10 px-2.5 py-1 text-bone/80">
                    <BadgeCheck className="size-3.5 text-red" aria-hidden /> Verified
                  </span>
                )}
              </div>
              <h1 className="display mt-5 text-[clamp(3.2rem,8vw,8rem)]">{artist.name}</h1>
              <p className="mt-5 text-lg text-bone/75">
                {artist.role} <span className="text-bone/30">·</span> {artist.genre}{" "}
                <span className="text-bone/30">·</span> {artist.location}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <FollowButton handle={artist.handle} name={artist.name} />
                <ButtonLink href="#pieces" variant="outline-bone" size="lg">
                  Shop {pieces.length} {pieces.length === 1 ? "piece" : "pieces"} <ArrowDown className="size-4" />
                </ButtonLink>
                {links.map((l) => (
                  <ButtonLink key={l.href} href={l.href} variant="outline-bone" size="lg">
                    {l.label}
                  </ButtonLink>
                ))}
              </div>

              <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-bone/15 pt-6">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse justify-end">
                    <dt className="mt-1.5 text-sm text-bone/55">{s.label}</dt>
                    <dd className="display text-[clamp(2rem,3.4vw,3rem)]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* About + pull-quote */}
      <section className="container-page grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Eyebrow className="text-smoke">{isHouse ? "About the house line" : `About ${shortName}`}</Eyebrow>
          <p className="mt-6 text-[clamp(1.2rem,1.7vw,1.5rem)] leading-relaxed">{artist.bio}</p>
          {!isHouse && (
            <p className="mt-6 max-w-md text-smoke">
              Every piece in this storefront is licensed from {shortName}, printed to order and pays {shortName} 30% of the sale.
            </p>
          )}
          {collections.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow text-smoke">Appears in</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {collections.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/collections/${c.slug}`}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-paper px-4 text-[15px] transition hover:bg-ink hover:text-bone"
                    >
                      <span className="size-2 rounded-full" style={{ background: c.accent }} aria-hidden />
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <figure className="lg:col-span-7 lg:pl-10">
          <span aria-hidden className="block">
            <Mark title="" className="h-12 w-auto md:h-16" />
          </span>
          <blockquote className="serif-italic mt-8 text-[clamp(2.4rem,5.2vw,4.8rem)] leading-[1.02]">
            {artist.quote}
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-3 text-smoke">
            <span className="h-px w-10 bg-ink/30" aria-hidden />
            {artist.name}
          </figcaption>
        </figure>
      </section>

      {/* Pieces */}
      <section id="pieces" className="container-page scroll-mt-6 pb-24 md:pb-32">
        <SectionHeading
          eyebrow={`${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"} by ${artist.name}`}
          title={
            <>
              The <span className="serif-italic font-normal">storefront</span>
            </>
          }
          aside={
            <Link href="/shop" className="group/all inline-flex items-center gap-2 font-medium">
              Shop everything <ArrowRight className="size-4 transition group-hover/all:translate-x-1" />
            </Link>
          }
          className="mb-12"
        />
        {pieces.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {pieces.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-paper p-10 text-center">
            <p className="display text-3xl">First pressing soon.</p>
            <p className="mt-2 text-smoke">Follow {shortName} to catch the first drop.</p>
          </div>
        )}
      </section>

      {/* More artists */}
      <section className="bg-paper py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            eyebrow="Keep digging"
            title={
              <>
                More <span className="serif-italic font-normal">artists</span>
              </>
            }
            aside={
              <Link href="/artists" className="group/all inline-flex items-center gap-2 font-medium">
                All artists <ArrowRight className="size-4 transition group-hover/all:translate-x-1" />
              </Link>
            }
            className="mb-10"
          />
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 xl:grid-cols-6">
            {others.map((c) => (
              <ArtistChip key={c.handle} creator={c} pieces={productsByCreator(c.handle).length} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

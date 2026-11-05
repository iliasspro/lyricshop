import { ArrowDown, ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AvatarStack } from "@/components/marketplace/avatar-stack";
import { CollectionMiniCard } from "@/components/marketplace/collection-card";
import { LinesMarquee } from "@/components/marketplace/lines-marquee";
import { CollectionSkeleton } from "@/components/marketplace/skeletons";
import { ProductCard } from "@/components/product/product-card";
import { Eyebrow, SectionHeading } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { COLLECTIONS, COLLECTION_BY_SLUG } from "@/lib/data/collections";
import { CREATOR_BY_HANDLE, type Creator } from "@/lib/data/creators";
import { productsInCollection } from "@/lib/data/products";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = COLLECTION_BY_SLUG[slug];
  if (!c) return { title: "Collection not found" };
  return {
    title: c.title,
    description: `${c.tagline} ${c.description}`,
    openGraph: { title: `${c.title} · Lyricshop`, description: c.tagline, images: [{ url: c.image }] },
  };
}

// The page itself never awaits params: the slug is URL data, so it's read inside Suspense
// and client navigations between collections can show the skeleton instantly.
export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <Suspense fallback={<CollectionSkeleton />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}

async function CollectionContent({ params }: Pick<PageProps<"/collections/[slug]">, "params">) {
  const { slug } = await params;
  const c = COLLECTION_BY_SLUG[slug];
  if (!c) notFound();

  const products = productsInCollection(c.slug);
  const number = String(COLLECTIONS.findIndex((x) => x.slug === c.slug) + 1).padStart(2, "0");
  const artists = [...new Set(products.map((p) => p.creator))]
    .map((handle) => CREATOR_BY_HANDLE[handle])
    .filter((a): a is Creator => !!a);
  const others = COLLECTIONS.filter((x) => x.slug !== c.slug);
  const light = !c.dark;

  return (
    <>
      {/* Hero */}
      <section className={cn("relative isolate overflow-hidden", light ? "bg-paper text-ink" : "bg-ink text-bone")}>
        <div className="relative h-[calc(100svh-6.75rem)] min-h-[600px] max-h-[920px]">
          <Image
            src={c.image}
            alt={`${c.title} collection: ${c.tagline}`}
            fill
            preload
            sizes="100vw"
            className="-z-10 object-cover"
            style={{ objectPosition: c.focus }}
          />
          {light ? (
            <>
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bone via-bone/55 to-transparent" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bone/80 via-bone/20 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/45 to-ink/5" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/70 via-ink/10 to-transparent" />
            </>
          )}
          <div
            className={cn(
              "absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b to-transparent",
              light ? "from-bone/70" : "from-ink/60",
            )}
          />

          <div className="container-page flex h-full flex-col justify-between pb-10 pt-6 md:pb-16">
            <nav aria-label="Breadcrumb">
              <ol className={cn("flex items-center gap-1.5 text-sm", light ? "text-ink/70" : "text-bone/70")}>
                <li>
                  <Link href="/collections" className="link-underline hover:text-current">
                    Collections
                  </Link>
                </li>
                <li aria-hidden>
                  <ChevronRight className="size-3.5" />
                </li>
                <li aria-current="page" className={light ? "text-ink" : "text-bone"}>
                  {c.title}
                </li>
              </ol>
            </nav>

            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-4xl">
                <Eyebrow className={light ? "text-ink/70" : "text-bone/70"}>
                  <span className="size-1.5 rounded-full" style={{ background: c.accent }} />
                  Collection {number} · {products.length} pieces
                </Eyebrow>
                <h1 className="display mt-5 text-[clamp(3.6rem,10vw,10rem)]">{c.title}</h1>
                <p className="serif-italic mt-3 text-[clamp(1.7rem,3.4vw,3rem)] leading-tight">{c.tagline}</p>
                <p className={cn("mt-5 max-w-xl text-lg leading-relaxed", light ? "text-ink/75" : "text-bone/75")}>
                  {c.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="#pieces" variant={light ? "primary" : "bone"} size="lg">
                    Shop the {products.length} pieces <ArrowDown className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="/studio" variant={light ? "outline" : "outline-bone"} size="lg">
                    Design your own
                  </ButtonLink>
                </div>
              </div>
              <AvatarStack creators={artists} tone={light ? "light" : "dark"} className="max-lg:hidden" />
            </div>
          </div>
        </div>
      </section>

      <LinesMarquee products={products} label={`Lines from ${c.title}`} tone={light ? "paper" : "ink"} />

      {/* Pieces */}
      <section id="pieces" className="container-page scroll-mt-6 py-24 md:py-32">
        <SectionHeading
          eyebrow={`${c.title} · ${products.length} pieces`}
          title={
            <>
              The <span className="serif-italic font-normal">pieces</span>
            </>
          }
          aside={<AvatarStack creators={artists} tone="light" />}
          className="mb-12"
        />
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-paper p-10 text-center">
            <p className="display text-3xl">Pressing now.</p>
            <p className="mt-2 text-smoke">The first pieces in this collection are on their way.</p>
          </div>
        )}
      </section>

      {/* Other collections */}
      <section className="bg-paper py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            eyebrow="Keep listening"
            title={
              <>
                Other <span className="serif-italic font-normal">moods</span>
              </>
            }
            aside={
              <Link href="/collections" className="group/all inline-flex items-center gap-2 font-medium">
                All collections <ArrowRight className="size-4 transition group-hover/all:translate-x-1" />
              </Link>
            }
            className="mb-10"
          />
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
            {others.map((o) => (
              <CollectionMiniCard key={o.slug} collection={o} count={productsInCollection(o.slug).length} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

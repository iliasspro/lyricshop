import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductView } from "@/components/product/product-view";
import { SectionHeading, Stars } from "@/components/ui/bits";
import { CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { COLLECTION_BY_SLUG } from "@/lib/data/collections";
import { PRODUCTS, getProduct, productsByCreator, relatedProducts } from "@/lib/data/products";
import { fontFor } from "@/lib/fonts";
import { GARMENTS } from "@/lib/garments";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not found" };
  const creator = CREATOR_BY_HANDLE[product.creator];
  return {
    title: `${product.title} by ${creator.name}`,
    description: product.description,
    openGraph: {
      title: `${product.title} — Lyricshop`,
      description: product.description,
      images: product.lifestyle ? [{ url: product.lifestyle }] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  // URL data stays inside Suspense so client navigations between products are instant;
  // every known slug is still prerendered via generateStaticParams.
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const creator = CREATOR_BY_HANDLE[product.creator];
  const garment = GARMENTS[product.garment];
  const collection = COLLECTION_BY_SLUG[product.collection];
  const moreFromArtist = productsByCreator(product.creator).filter((p) => p.slug !== product.slug).slice(0, 4);
  const related = relatedProducts(product, 4).filter((p) => !moreFromArtist.some((m) => m.slug === p.slug));
  const textLayers = [...product.design.front, ...product.design.back].filter((l) => l.type === "text");
  const lead = textLayers.sort((a, b) => (b.type === "text" && a.type === "text" ? b.size - a.size : 0))[0];
  const line = lead?.type === "text" ? lead.text.replace(/\n/g, " ") : product.title;
  const lineFont = lead?.type === "text" ? fontFor(lead.font) : fontFor("dm-serif-display");
  const dist = distribution(product.rating);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    brand: { "@type": "Brand", name: "Lyricshop" },
    image: product.lifestyle ? [product.lifestyle] : undefined,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-page pb-24 pt-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-smoke">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          <span>/</span>
          <Link href={`/shop?type=${product.garment}`} className="hover:text-ink">
            {garment.short}s
          </Link>
          <span>/</span>
          <Link href={`/collections/${collection.slug}`} className="hover:text-ink">
            {collection.title}
          </Link>
          <span>/</span>
          <span className="text-ink">{product.title}</span>
        </nav>
        <ProductView product={product} />
      </div>

      {/* The line */}
      <section className="grain overflow-hidden bg-ink py-24 text-bone md:py-32">
        <div className="container-page relative z-10 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-bone/50">The line</p>
            <p
              className="mt-6 max-w-5xl text-[clamp(3rem,9vw,8.5rem)] leading-[0.95]"
              style={{ fontFamily: `"${lineFont.family}"`, fontWeight: lineFont.weight, fontStyle: lineFont.style }}
            >
              <span className="text-red">&ldquo;</span>
              {lead?.type === "text" && lead.uppercase ? line.toUpperCase() : line}
              <span className="text-red">&rdquo;</span>
            </p>
          </div>
          <Link href={`/artists/${creator.handle}`} className="group/artist flex items-center gap-4">
            <span className="relative size-20 overflow-hidden rounded-full bg-ink-3">
              {creator.avatar && <Image src={creator.avatar} alt="" fill sizes="80px" className="object-cover" />}
            </span>
            <span>
              <span className="block text-bone/50">Written by</span>
              <span className="display block text-2xl group-hover/artist:text-red">{creator.name}</span>
              <span className="block text-sm text-bone/60">
                {creator.role} · {creator.location}
              </span>
            </span>
          </Link>
        </div>
        <p className="container-page serif-italic relative z-10 mt-12 max-w-2xl text-2xl text-bone/70">&ldquo;{creator.quote}&rdquo;</p>
      </section>

      {/* Reviews */}
      <section id="reviews" className="container-page scroll-mt-6 py-24">
        <div className="grid gap-12 md:grid-cols-[320px_1fr]">
          <div>
            <p className="eyebrow text-smoke">Reviews</p>
            <p className="display mt-4 text-7xl">{product.rating.toFixed(1)}</p>
            <Stars rating={product.rating} className="mt-3" />
            <p className="mt-2 text-sm text-smoke">Based on {product.reviews} verified purchases</p>
          </div>
          <div className="space-y-3 self-center">
            {dist.map(({ stars, share }) => (
              <div key={stars} className="flex items-center gap-4 font-mono text-sm">
                <span className="w-10">{stars}★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
                  <span className="block h-full rounded-full bg-ink" style={{ width: `${share}%` }} />
                </span>
                <span className="w-10 text-right text-smoke">{share}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {moreFromArtist.length > 0 && (
        <section className="container-page pb-24">
          <SectionHeading
            eyebrow={`More from ${creator.name}`}
            title={
              <>
                Same pen, <span className="serif-italic font-normal">new lines</span>
              </>
            }
            aside={
              <Link href={`/artists/${creator.handle}`} className="font-medium underline-offset-4 hover:underline">
                Visit the shop
              </Link>
            }
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {moreFromArtist.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-28">
        <SectionHeading eyebrow="Complete the look" title="Pairs well with" className="mb-10" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {related.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

/** Deterministic star distribution that averages to the product rating. */
function distribution(rating: number) {
  const five = Math.round(Math.min(96, Math.max(55, (rating - 4) * 100 + 8)));
  const four = Math.round((100 - five) * 0.66);
  const three = Math.round((100 - five - four) * 0.6);
  const two = Math.round((100 - five - four - three) * 0.6);
  const one = Math.max(0, 100 - five - four - three - two);
  return [
    { stars: 5, share: five },
    { stars: 4, share: four },
    { stars: 3, share: three },
    { stars: 2, share: two },
    { stars: 1, share: one },
  ];
}

function ProductSkeleton() {
  return (
    <div className="container-page pb-24 pt-6 md:pt-8" aria-busy="true" aria-label="Loading product">
      <div className="mb-6 h-3 w-64 rounded bg-paper" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <div>
          <div className="aspect-[4/5] animate-pulse rounded-[32px] bg-paper" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="size-20 rounded-2xl bg-paper md:size-24" />
            ))}
          </div>
        </div>
        <div className="space-y-5 lg:pt-2">
          <div className="h-11 w-48 rounded-full bg-paper" />
          <div className="h-14 w-4/5 rounded-2xl bg-paper" />
          <div className="h-6 w-32 rounded bg-paper" />
          <div className="h-20 w-full rounded-2xl bg-paper" />
          <div className="flex gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="size-9 rounded-full bg-paper" />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-2xl bg-paper" />
            ))}
          </div>
          <div className="h-14 w-full rounded-full bg-paper" />
        </div>
      </div>
    </div>
  );
}

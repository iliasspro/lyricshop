"use client";

import { ArrowRight, Heart } from "lucide-react";
import { EmptyState } from "@/components/checkout/summary-bits";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { PRODUCT_BY_SLUG } from "@/lib/data/products";
import { useLibrary } from "@/lib/store/library";

export function WishlistTab() {
  const wishlist = useLibrary((s) => s.wishlist);
  const products = wishlist.filter((slug) => Object.hasOwn(PRODUCT_BY_SLUG, slug)).map((slug) => PRODUCT_BY_SLUG[slug]);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        className="mt-10"
        title={
          <>
            Nothing <span className="serif-italic font-normal">saved</span> yet.
          </>
        }
        body="Tap the heart on any piece to keep it here for later. We'll hold your spot, not the stock."
      >
        <ButtonLink href="/shop" size="lg">
          Browse the shop <ArrowRight className="size-4" />
        </ButtonLink>
        <ButtonLink href="/collections" variant="outline" size="lg">
          Explore collections
        </ButtonLink>
      </EmptyState>
    );
  }

  return (
    <div className="mt-10">
      <p className="mb-6 font-mono text-sm text-smoke">
        {products.length} {products.length === 1 ? "piece" : "pieces"} saved
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { PRODUCTS } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Hoodies, tees, crewnecks, totes and caps printed with lines by independent artists.",
};

export default function ShopPage() {
  return (
    <div className="container-page pb-28 pt-10 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8">
        <div>
          <p className="eyebrow text-smoke">The shop · {PRODUCTS.length} pieces</p>
          <h1 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)]">
            Every line <span className="serif-italic font-normal">we&apos;ve</span> printed.
          </h1>
        </div>
        <p className="max-w-sm text-smoke">
          Printed to order on heavyweight organic blanks. Every purchase pays the artist who wrote the line.
        </p>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <ShopBrowser />
      </Suspense>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse rounded-[22px] bg-paper" />
          <div className="mt-4 h-4 w-2/3 rounded bg-paper" />
          <div className="mt-2 h-3 w-1/3 rounded bg-paper" />
        </div>
      ))}
    </div>
  );
}

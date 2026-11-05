"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/cn";
import { PRODUCTS } from "@/lib/data/products";

const TABS = [
  { id: "new", label: "Fresh off the press", pick: () => [...PRODUCTS].sort((a, b) => a.age - b.age) },
  { id: "best", label: "Most worn", pick: () => [...PRODUCTS].sort((a, b) => b.sold - a.sold) },
  { id: "hoodies", label: "Hoodies & crews", pick: () => PRODUCTS.filter((p) => p.garment === "hoodie" || p.garment === "crewneck") },
  { id: "under40", label: "Under $40", pick: () => PRODUCTS.filter((p) => p.price < 40) },
] as const;

export function ProductRail() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("new");
  const items = TABS.find((t) => t.id === tab)!.pick().slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-[15px] transition",
                tab === t.id ? "bg-ink text-bone" : "bg-paper hover:bg-sand",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Link href="/shop" className="group/all inline-flex items-center gap-2 text-[15px] font-medium">
          Shop all {PRODUCTS.length} pieces
          <ArrowRight className="size-4 transition group-hover/all:translate-x-1" />
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={`${tab}-${p.slug}`} product={p} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}

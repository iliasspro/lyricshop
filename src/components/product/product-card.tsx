"use client";

import { Heart, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ProductBadge, Swatch } from "@/components/ui/bits";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { CREATOR_BY_HANDLE } from "@/lib/data/creators";
import type { Product } from "@/lib/data/products";
import { GARMENTS } from "@/lib/garments";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { useLibrary } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";

export function ProductCard({
  product,
  priority = false,
  className,
  tone = "light",
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  tone?: "light" | "dark";
}) {
  const [colorId, setColorId] = useState(product.colors[0]);
  const color = colorFor(colorId);
  const creator = CREATOR_BY_HANDLE[product.creator];
  const garment = GARMENTS[product.garment];
  const wished = useLibrary((s) => s.wishlist.includes(product.slug));
  const toggleWish = useLibrary((s) => s.toggleWish);
  const hydrated = useUI((s) => s.hydrated);
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const hasBack = product.design.back.length > 0 && !!garment.views.back;
  const hoverMedia = product.lifestyle ? "photo" : hasBack ? "back" : null;
  const href = `/product/${product.slug}?color=${colorId}`;

  const quickAdd = (size: string) => {
    add({
      kind: "product",
      slug: product.slug,
      title: product.title,
      creator: product.creator,
      garment: product.garment,
      color: colorId,
      size,
      unitPrice: product.price,
      design: product.design,
    });
    toast.success(`${product.title} added`, { description: `${color.name} · ${size}` });
    setCartOpen(true);
  };

  return (
    <article className={cn("group/card relative flex flex-col", className)}>
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-[22px]",
          tone === "dark" ? "bg-ink-2" : "bg-[#e5ddcf]",
        )}
      >
        <Link href={href} className="absolute inset-0 z-[1]" aria-label={product.title}>
          <span className="sr-only">{product.title}</span>
        </Link>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center p-[7%] transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
            hoverMedia ? "group-hover/card:opacity-0" : "group-hover/card:scale-[1.04]",
          )}
        >
          <GarmentMockup
            garment={product.garment}
            color={color.hex}
            layers={product.design.front}
            className="h-full w-full"
            title={`${product.title} in ${color.name}`}
          />
        </div>

        {hoverMedia === "photo" && product.lifestyle && (
          <Image
            src={product.lifestyle}
            alt={`${product.title} worn`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className="scale-[1.06] object-cover opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] group-hover/card:scale-100 group-hover/card:opacity-100"
          />
        )}
        {hoverMedia === "back" && (
          <div className="absolute inset-0 flex items-center justify-center p-[7%] opacity-0 transition-opacity duration-700 group-hover/card:opacity-100">
            <GarmentMockup
              garment={product.garment}
              color={color.hex}
              view="back"
              layers={product.design.back}
              className="h-full w-full"
            />
          </div>
        )}

        <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-wrap gap-1.5">
          {product.badges.slice(0, 1).map((b) => (
            <ProductBadge key={b} badge={b} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const on = toggleWish(product.slug);
            toast(on ? "Saved to your wishlist" : "Removed from wishlist");
          }}
          className={cn(
            "absolute right-3 top-3 z-[2] grid size-9 place-items-center rounded-full bg-bone/80 backdrop-blur transition hover:bg-bone",
            hydrated && wished ? "text-red" : "text-ink",
          )}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={hydrated && wished}
        >
          <Heart className="size-4" fill={hydrated && wished ? "currentColor" : "none"} />
        </button>

        <div className="absolute inset-x-3 bottom-3 z-[2] translate-y-3 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover/card:translate-y-0 group-hover/card:opacity-100 max-md:hidden">
          <div className="flex items-center gap-1 rounded-2xl bg-bone/90 p-1.5 shadow-lg backdrop-blur">
            <span className="eyebrow flex items-center gap-1 pl-2 pr-1 !text-[10px] text-smoke">
              <Plus className="size-3" /> Add
            </span>
            <div className="flex flex-1 flex-wrap justify-end gap-1">
              {garment.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => quickAdd(size)}
                  className="h-8 min-w-8 rounded-xl px-2 font-mono text-xs transition hover:bg-ink hover:text-bone"
                >
                  {size === "One size" ? "Add to bag" : size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium leading-snug">
            <Link href={href} className="link-underline">
              {product.title}
            </Link>
          </h3>
          <p className={cn("mt-0.5 truncate text-sm", tone === "dark" ? "text-ash" : "text-smoke")}>
            by{" "}
            <Link href={`/artists/${creator?.handle}`} className="hover:text-current">
              {creator?.name}
            </Link>
          </p>
        </div>
        <p className="shrink-0 font-mono text-sm tabular-nums">{formatPrice(product.price)}</p>
      </div>
      <div className="mt-3 flex items-center gap-1.5 px-1">
        {product.colors.slice(0, 5).map((id) => {
          const c = colorFor(id);
          return <Swatch key={id} hex={c.hex} label={c.name} size="sm" selected={id === colorId} onClick={() => setColorId(id)} />;
        })}
        {product.colors.length > 5 && <span className="font-mono text-xs text-smoke">+{product.colors.length - 5}</span>}
      </div>
    </article>
  );
}

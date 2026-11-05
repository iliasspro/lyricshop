"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  ChevronDown,
  Heart,
  Leaf,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Ruler,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ProductBadge, Stars, Swatch } from "@/components/ui/bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { CREATOR_BY_HANDLE } from "@/lib/data/creators";
import type { Product } from "@/lib/data/products";
import { GARMENTS } from "@/lib/garments";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { useLibrary } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";
import { SizeGuide } from "./size-guide";

type Media = { id: string; label: string; kind: "front" | "back" | "photo" | "detail" };

function ColorFromQuery({ product, onColor }: { product: Product; onColor: (c: string) => void }) {
  const params = useSearchParams();
  const c = params.get("color");
  useEffect(() => {
    if (c && product.colors.includes(c)) onColor(c);
  }, [c, product.colors, onColor]);
  return null;
}

export function ProductView({ product }: { product: Product }) {
  const garment = GARMENTS[product.garment];
  const creator = CREATOR_BY_HANDLE[product.creator];
  const [colorId, setColorId] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(garment.sizes.length === 1 ? garment.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [media, setMedia] = useState<Media["kind"]>("front");
  const [sizeError, setSizeError] = useState(false);
  const [guide, setGuide] = useState(false);
  const color = colorFor(colorId);
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const hydrated = useUI((s) => s.hydrated);
  const wished = useLibrary((s) => s.wishlist.includes(product.slug));
  const toggleWish = useLibrary((s) => s.toggleWish);

  const hasBack = product.design.back.length > 0 && !!garment.views.back;
  const items: Media[] = [
    { id: "front", label: "Front", kind: "front" },
    ...(hasBack ? [{ id: "back", label: "Back", kind: "back" as const }] : []),
    ...(product.lifestyle ? [{ id: "photo", label: "Worn", kind: "photo" as const }] : []),
    { id: "detail", label: "Print", kind: "detail" },
  ];

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      toast.error("Pick a size first");
      return;
    }
    add({
      kind: "product",
      slug: product.slug,
      title: product.title,
      creator: product.creator,
      garment: product.garment,
      color: colorId,
      size,
      qty,
      unitPrice: product.price,
      design: product.design,
    });
    toast.success(`${product.title} added to your bag`, { description: `${color.name} · ${size} · ×${qty}` });
    setCartOpen(true);
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
      <Suspense fallback={null}>
        <ColorFromQuery product={product} onColor={setColorId} />
      </Suspense>

      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Stage product={product} colorHex={color.hex} kind={media} />
        <div className="mt-4 flex gap-3">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMedia(m.kind)}
              className={cn(
                "group/thumb relative aspect-square w-20 min-w-0 overflow-hidden rounded-2xl bg-[#e5ddcf] ring-offset-2 ring-offset-bone transition md:w-24",
                media === m.kind ? "ring-2 ring-ink" : "opacity-75 hover:opacity-100",
              )}
              aria-label={`Show ${m.label.toLowerCase()} view`}
              aria-pressed={media === m.kind}
            >
              {m.kind === "photo" && product.lifestyle ? (
                <Image src={product.lifestyle} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <div className={cn("h-full w-full p-1.5", m.kind === "detail" && "scale-[2.1]")}>
                  <GarmentMockup
                    garment={product.garment}
                    color={color.hex}
                    view={m.kind === "back" ? "back" : "front"}
                    layers={m.kind === "back" ? product.design.back : product.design.front}
                    shadow={false}
                    className="h-full w-full"
                  />
                </div>
              )}
              <span className="absolute inset-x-0 bottom-1 text-center font-mono text-[10px] text-ink/70">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Buy box */}
      <div className="lg:pt-2">
        <Link href={`/artists/${creator.handle}`} className="group/artist inline-flex items-center gap-3 rounded-full bg-paper py-1.5 pl-1.5 pr-4 transition hover:bg-sand">
          <span className="relative size-8 overflow-hidden rounded-full bg-ink">
            {creator.avatar ? (
              <Image src={creator.avatar} alt="" fill sizes="32px" className="object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center font-mono text-[10px] text-bone">LS</span>
            )}
          </span>
          <span className="text-sm">
            by <span className="font-medium">{creator.name}</span>
          </span>
          {creator.verified && <BadgeCheck className="size-4 text-red" aria-label="Verified artist" />}
        </Link>

        <div className="mt-6 flex flex-wrap gap-2">
          {product.badges.map((b) => (
            <ProductBadge key={b} badge={b} />
          ))}
        </div>
        <h1 className="display mt-4 text-[clamp(2.4rem,4.2vw,4rem)]">{product.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="font-mono text-2xl tabular-nums">{formatPrice(product.price)}</p>
          <a href="#reviews" className="hover:underline">
            <Stars rating={product.rating} count={product.reviews} />
          </a>
        </div>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">{product.description}</p>

        {/* Color */}
        <div className="mt-9">
          <p className="text-sm">
            <span className="text-smoke">Color</span> <span className="ml-1 font-medium">{color.name}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.colors.map((id) => {
              const c = colorFor(id);
              return <Swatch key={id} hex={c.hex} label={c.name} size="lg" selected={id === colorId} onClick={() => setColorId(id)} />;
            })}
          </div>
        </div>

        {/* Size */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              <span className="text-smoke">Size</span> {size && <span className="ml-1 font-medium">{size}</span>}
            </p>
            {garment.sizes.length > 1 && (
              <button type="button" onClick={() => setGuide(true)} className="inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline">
                <Ruler className="size-4" /> Size guide
              </button>
            )}
          </div>
          <div className={cn("mt-3 grid grid-cols-6 gap-2", garment.sizes.length === 1 && "grid-cols-1 sm:grid-cols-2")} role="radiogroup" aria-label="Size">
            {garment.sizes.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                }}
                className={cn(
                  "h-12 rounded-2xl border font-mono text-sm transition",
                  size === s ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink",
                  sizeError && !size && "border-red",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-smoke">{garment.fit}</p>
        </div>

        {/* Add: on phones the button takes its own full-width line under the stepper and heart */}
        <div className="mt-8 flex flex-wrap gap-3 sm:flex-nowrap">
          <div className="flex h-14 items-center rounded-full border border-ink/15">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="grid size-14 place-items-center rounded-full hover:bg-ink/5" aria-label="Decrease quantity">
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center font-mono tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button type="button" onClick={() => setQty(Math.min(20, qty + 1))} className="grid size-14 place-items-center rounded-full hover:bg-ink/5" aria-label="Increase quantity">
              <Plus className="size-4" />
            </button>
          </div>
          <Button variant="accent" size="lg" className="h-14 flex-1 max-sm:order-last max-sm:basis-full" onClick={addToBag}>
            {size ? `Add to bag · ${formatPrice(product.price * qty)}` : "Select a size"}
          </Button>
          <button
            type="button"
            onClick={() => {
              const on = toggleWish(product.slug);
              toast(on ? "Saved to your wishlist" : "Removed from wishlist");
            }}
            className={cn(
              "grid size-14 shrink-0 place-items-center rounded-full border border-ink/15 transition hover:border-ink max-sm:ml-auto",
              hydrated && wished && "text-red",
            )}
            aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={hydrated && wished}
          >
            <Heart className="size-5" fill={hydrated && wished ? "currentColor" : "none"} />
          </button>
        </div>

        <Link
          href={`/studio?product=${product.slug}&color=${colorId}`}
          className="group/custom mt-3 flex h-14 items-center justify-center gap-2 rounded-full border border-dashed border-ink/30 text-[15px] transition hover:border-ink hover:bg-ink hover:text-bone"
        >
          <Sparkles className="size-4 text-red" /> Remix this design in the Studio
        </Link>

        <ul className="mt-8 grid gap-3 rounded-3xl bg-paper p-5 text-sm sm:grid-cols-2">
          {[
            { icon: Truck, text: "Free shipping over $100" },
            { icon: RefreshCw, text: "Free 30-day exchanges" },
            { icon: Package, text: "Printed to order in 3 days" },
            { icon: Leaf, text: "Organic heavyweight cotton" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <Icon className="size-4 shrink-0 text-red" /> {text}
            </li>
          ))}
        </ul>

        <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          <Accordion title="Details" defaultOpen>
            <ul className="space-y-2">
              <li>
                <span className="text-smoke">Blank:</span> {garment.name}
              </li>
              <li>
                <span className="text-smoke">Fabric:</span> {garment.fabric}
              </li>
              <li>
                <span className="text-smoke">Print:</span> {product.printMethod}
              </li>
              <li>
                <span className="text-smoke">Fit:</span> {garment.fit}
              </li>
            </ul>
          </Accordion>
          <Accordion title="Shipping & returns">
            Printed to order and shipped within 3 business days. Standard delivery is 4–7 business days and free over $100; express is
            1–3 days. Catalog pieces can be exchanged or returned within 30 days of delivery.
          </Accordion>
          <Accordion title="Care">
            Wash cold inside out, hang dry, iron on reverse. The print is cured to last, and it&apos;ll only crack in the right places.
          </Accordion>
          <Accordion title={`About ${creator.name}`}>
            <p>{creator.bio}</p>
            <Link href={`/artists/${creator.handle}`} className="mt-3 inline-block font-medium underline underline-offset-4">
              Visit the shop
            </Link>
          </Accordion>
        </div>
      </div>

      <AnimatePresence>{guide && <SizeGuide garment={product.garment} onClose={() => setGuide(false)} />}</AnimatePresence>

      {/* mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-ink/10 bg-bone/90 p-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-sm font-medium">{product.title}</p>
          <p className="font-mono text-sm">{formatPrice(product.price)}</p>
        </div>
        <Button variant="accent" onClick={addToBag}>
          {size ? "Add to bag" : "Pick size"}
        </Button>
      </div>
    </div>
  );
}

function Stage({ product, colorHex, kind }: { product: Product; colorHex: string; kind: Media["kind"] }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoom, setZoom] = useState(false);
  const zoomable = kind !== "photo";

  return (
    <div
      className={cn(
        "relative aspect-[4/5] overflow-hidden rounded-[32px] bg-[#e5ddcf]",
        zoomable && "cursor-zoom-in",
      )}
      onMouseMove={(e) => {
        if (!zoomable) return;
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onMouseEnter={() => zoomable && setZoom(true)}
      onMouseLeave={() => setZoom(false)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={kind}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {kind === "photo" && product.lifestyle ? (
            <Image src={product.lifestyle} alt={`${product.title} worn`} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" priority />
          ) : (
            <div
              className="h-full w-full p-[6%] transition-transform duration-300 ease-out"
              style={{
                transform: zoom ? "scale(1.9)" : kind === "detail" ? "scale(1.8)" : "scale(1)",
                transformOrigin: zoom ? origin : kind === "detail" ? "50% 38%" : "50% 50%",
              }}
            >
              <GarmentMockup
                garment={product.garment}
                color={colorHex}
                view={kind === "back" ? "back" : "front"}
                layers={kind === "back" ? product.design.back : product.design.front}
                className="h-full w-full"
                title={`${product.title} ${kind} view`}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {zoomable && !zoom && (
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-bone/80 px-3 py-1 font-mono text-[11px] backdrop-blur max-md:hidden">
          Hover to zoom
        </span>
      )}
    </div>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left font-medium" aria-expanded={open}>
        {title}
        <ChevronDown className={cn("size-5 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 leading-relaxed text-smoke">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid size-10 place-items-center rounded-full bg-paper transition hover:bg-sand" aria-label="Close">
      <X className="size-5" />
    </button>
  );
}

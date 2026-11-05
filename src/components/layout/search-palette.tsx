"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CornerDownLeft, Search, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Mark } from "@/components/brand/logo";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { COLLECTIONS } from "@/lib/data/collections";
import { CREATORS, CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { PRODUCTS, type Product } from "@/lib/data/products";
import { GARMENTS } from "@/lib/garments";
import { formatPrice } from "@/lib/pricing";
import { useUI } from "@/lib/store/ui";

type Result =
  | { kind: "product"; href: string; product: Product }
  | { kind: "artist"; href: string; title: string; sub: string; avatar: string | null }
  | { kind: "collection"; href: string; title: string; sub: string; image: string }
  | { kind: "page"; href: string; title: string; sub: string };

const PAGES = [
  { href: "/studio", title: "Design Studio", sub: "Put your own words on a hoodie, tee or tote" },
  { href: "/sell", title: "Sell with us", sub: "Open a shop and keep 30% of every sale" },
  { href: "/help#sizing", title: "Size guide", sub: "Measurements for every blank" },
  { href: "/help#shipping", title: "Shipping & returns", sub: "Delivery times, exchanges" },
  { href: "/brand", title: "Brand & logo", sub: "The Lyricshop identity" },
];

const lyricText = (p: Product) =>
  [...p.design.front, ...p.design.back]
    .map((l) => (l.type === "text" ? l.text : ""))
    .join(" ")
    .replace(/\n/g, " ");

function score(haystack: string, q: string) {
  const h = haystack.toLowerCase();
  if (!q) return 0;
  if (h.startsWith(q)) return 3;
  if (h.includes(` ${q}`)) return 2;
  return h.includes(q) ? 1 : 0;
}

export function SearchPalette() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUI.getState().searchOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // The dialog mounts fresh on every open, so the query and highlight start clean.
  return <AnimatePresence>{open && <SearchDialog key="search" onClose={() => setOpen(false)} />}</AnimatePresence>;
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const setOpen = (value: boolean) => {
    if (!value) onClose();
  };

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      return [
        ...PRODUCTS.filter((p) => p.badges.includes("new")).slice(0, 4).map((p) => ({ kind: "product" as const, href: `/product/${p.slug}`, product: p })),
        ...PAGES.slice(0, 2).map((p) => ({ kind: "page" as const, ...p })),
      ];
    }
    const products = PRODUCTS.map((p) => {
      const creator = CREATOR_BY_HANDLE[p.creator];
      const s =
        score(p.title, query) * 3 +
        score(lyricText(p), query) * 2 +
        score(creator?.name ?? "", query) * 2 +
        score(GARMENTS[p.garment].short, query) +
        score(p.collection.replace("-", " "), query);
      return { p, s };
    })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map(({ p }) => ({ kind: "product" as const, href: `/product/${p.slug}`, product: p }));
    const artists = CREATORS.filter((c) => score(`${c.name} ${c.handle} ${c.genre} ${c.role}`, query) > 0)
      .slice(0, 3)
      .map((c) => ({ kind: "artist" as const, href: `/artists/${c.handle}`, title: c.name, sub: `${c.role} · ${c.genre}`, avatar: c.avatar }));
    const collections = COLLECTIONS.filter((c) => score(`${c.title} ${c.tagline}`, query) > 0).map((c) => ({
      kind: "collection" as const,
      href: `/collections/${c.slug}`,
      title: c.title,
      sub: c.tagline,
      image: c.image,
    }));
    const pages = PAGES.filter((p) => score(`${p.title} ${p.sub}`, query) > 0).map((p) => ({ kind: "page" as const, ...p }));
    return [...products, ...artists, ...collections, ...pages];
  }, [q]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    setOpen(false);
    router.push(r.href);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search">
      <motion.div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
      />
      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-bone shadow-[0_40px_120px_-20px_rgba(0,0,0,.5)]"
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 border-b border-ink/10 px-5">
          <Search className="size-5 text-smoke" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(results.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (results[active]) go(results[active]);
                else if (q.trim()) {
                  setOpen(false);
                  router.push(`/studio?text=${encodeURIComponent(q.trim())}`);
                }
              } else if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search a lyric, an artist, a hoodie…"
            className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-smoke"
            aria-label="Search"
          />
          <kbd className="rounded-md bg-ink/6 px-2 py-1 font-mono text-[11px]">esc</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!q && <p className="eyebrow px-3 pb-2 pt-3 text-smoke">Fresh off the press</p>}
          {results.map((r, i) => (
            <button
              key={r.href + i}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition-colors",
                active === i ? "bg-ink text-bone" : "hover:bg-ink/5",
              )}
            >
              <ResultThumb r={r} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.kind === "product" ? r.product.title : r.title}</p>
                <p className={cn("truncate text-sm", active === i ? "text-bone/60" : "text-smoke")}>
                  {r.kind === "product"
                    ? `${CREATOR_BY_HANDLE[r.product.creator]?.name} · ${formatPrice(r.product.price)}`
                    : r.sub}
                </p>
              </div>
              <span className={cn("eyebrow !text-[10px]", active === i ? "text-bone/60" : "text-smoke")}>{r.kind}</span>
              {active === i && <CornerDownLeft className="size-4" />}
            </button>
          ))}
          {q && results.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="display text-2xl">Nobody&apos;s printed that line yet.</p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/studio?text=${encodeURIComponent(q.trim())}`);
                }}
                className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-red px-5 py-3 text-sm font-medium text-ink"
              >
                <Sparkles className="size-4" /> Put &ldquo;{q.trim()}&rdquo; on a hoodie <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ResultThumb({ r }: { r: Result }) {
  const cls = "relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#e5ddcf]";
  if (r.kind === "product") {
    return (
      <span className={cls}>
        <GarmentMockup
          garment={r.product.garment}
          color={colorFor(r.product.colors[0]).hex}
          layers={r.product.design.front}
          shadow={false}
          className="h-full w-full"
        />
      </span>
    );
  }
  if (r.kind === "artist" && r.avatar) {
    return (
      <span className={cn(cls, "rounded-full")}>
        <Image src={r.avatar} alt="" fill sizes="48px" className="object-cover" />
      </span>
    );
  }
  if (r.kind === "collection") {
    return (
      <span className={cls}>
        <Image src={r.image} alt="" fill sizes="48px" className="object-cover" />
      </span>
    );
  }
  return (
    <span className={cn(cls, "grid place-items-center bg-ink")}>
      <Mark tone="bone" detail={false} className="h-5 w-auto" />
    </span>
  );
}

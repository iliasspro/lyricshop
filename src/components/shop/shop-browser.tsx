"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, ChevronDown, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Mark } from "@/components/brand/logo";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/cn";
import { GARMENT_COLORS } from "@/lib/colors";
import { COLLECTIONS } from "@/lib/data/collections";
import { CREATORS, CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { PRODUCTS, type Product } from "@/lib/data/products";
import { GARMENT_LIST, GARMENTS, type GarmentId } from "@/lib/garments";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "new", label: "Newest" },
  { id: "best", label: "Bestselling" },
  { id: "rating", label: "Top rated" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

const PRICES = [
  { id: "0-40", label: "Under $40", test: (p: number) => p < 40 },
  { id: "40-70", label: "$40 – $70", test: (p: number) => p >= 40 && p <= 70 },
  { id: "70+", label: "Over $70", test: (p: number) => p > 70 },
];

const plural: Record<GarmentId, string> = {
  hoodie: "Hoodies",
  tee: "Tees",
  crewneck: "Crewnecks",
  longsleeve: "Long sleeves",
  tote: "Totes",
  cap: "Caps",
};

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

const lyricText = (p: Product) =>
  [...p.design.front, ...p.design.back]
    .map((l) => (l.type === "text" ? l.text : ""))
    .join(" ")
    .toLowerCase();

export function ShopBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [panel, setPanel] = useState(false);

  const types = list(params.get("type")) as GarmentId[];
  const collections = list(params.get("collection"));
  const artists = list(params.get("artist"));
  const colors = list(params.get("color"));
  const price = params.get("price");
  const sort = (params.get("sort") ?? "featured") as (typeof SORTS)[number]["id"];
  const q = params.get("q") ?? "";
  // local draft of the search box; resets whenever the URL's q changes underneath it
  const [draft, setDraft] = useState({ q, value: q });
  const query = draft.q === q ? draft.value : q;
  const setQuery = (value: string) => setDraft({ q, value });

  const update = (key: string, value: string | string[] | null) => {
    const next = new URLSearchParams(params.toString());
    const v = Array.isArray(value) ? value.join(",") : value;
    if (v) next.set(key, v);
    else next.delete(key);
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const toggle = (key: string, current: string[], value: string) =>
    update(key, current.includes(value) ? current.filter((x) => x !== value) : [...current, value]);

  // debounce the search box into the URL
  useEffect(() => {
    if (query === q) return;
    const t = setTimeout(() => update("q", query.trim() || null), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const priceTest = PRICES.find((p) => p.id === price)?.test;
    const filtered = PRODUCTS.filter((p) => {
      if (types.length && !types.includes(p.garment)) return false;
      if (collections.length && !collections.includes(p.collection)) return false;
      if (artists.length && !artists.includes(p.creator)) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c))) return false;
      if (priceTest && !priceTest(p.price)) return false;
      if (needle) {
        const hay = `${p.title} ${lyricText(p)} ${CREATOR_BY_HANDLE[p.creator]?.name ?? ""} ${GARMENTS[p.garment].short}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    if (sort === "new") sorted.sort((a, b) => a.age - b.age);
    else if (sort === "best") sorted.sort((a, b) => b.sold - a.sold);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [types, collections, artists, colors, price, sort, q]);

  const chips = [
    ...types.map((t) => ({ key: "type", value: t, label: plural[t], list: types })),
    ...collections.map((c) => ({ key: "collection", value: c, label: COLLECTIONS.find((x) => x.slug === c)?.title ?? c, list: collections })),
    ...artists.map((a) => ({ key: "artist", value: a, label: CREATOR_BY_HANDLE[a]?.name ?? a, list: artists })),
    ...colors.map((c) => ({ key: "color", value: c, label: GARMENT_COLORS.find((x) => x.id === c)?.name ?? c, list: colors })),
  ];
  const active = chips.length + (price ? 1 : 0) + (q ? 1 : 0);
  // colors that actually appear in the catalog
  const catalogColors = GARMENT_COLORS.filter((c) => PRODUCTS.some((p) => p.colors.includes(c.id)));

  const filters = (
    <div className="space-y-9">
      <FilterGroup title="Piece">
        {GARMENT_LIST.map((g) => (
          <CheckRow
            key={g.id}
            label={plural[g.id]}
            count={PRODUCTS.filter((p) => p.garment === g.id).length}
            checked={types.includes(g.id)}
            onChange={() => toggle("type", types, g.id)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Collection">
        {COLLECTIONS.map((c) => (
          <CheckRow
            key={c.slug}
            label={c.title}
            count={PRODUCTS.filter((p) => p.collection === c.slug).length}
            checked={collections.includes(c.slug)}
            onChange={() => toggle("collection", collections, c.slug)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Artist">
        {CREATORS.map((c) => (
          <CheckRow
            key={c.handle}
            label={c.name}
            count={PRODUCTS.filter((p) => p.creator === c.handle).length}
            checked={artists.includes(c.handle)}
            onChange={() => toggle("artist", artists, c.handle)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {catalogColors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle("color", colors, c.id)}
              title={c.name}
              aria-label={c.name}
              aria-pressed={colors.includes(c.id)}
              className={cn(
                "relative size-8 rounded-full border border-ink/15 ring-offset-2 ring-offset-bone transition",
                colors.includes(c.id) ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-ink/25",
              )}
              style={{ background: c.hex }}
            >
              {colors.includes(c.id) && (
                <Check className="absolute inset-0 m-auto size-4" style={{ color: c.id === "black" || c.id === "navy" || c.id === "forest" || c.id === "burgundy" || c.id === "charcoal" || c.id === "olive" ? "#F3EEE5" : "#0F0E0D" }} />
              )}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICES.map((p) => (
          <CheckRow key={p.id} label={p.label} radio checked={price === p.id} onChange={() => update("price", price === p.id ? null : p.id)} />
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="mt-8">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 md:max-w-sm">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-smoke" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a lyric or artist"
            aria-label="Search the shop"
            className="h-11 w-full rounded-full border border-ink/12 bg-white/50 pl-11 pr-4 text-[15px] outline-none transition focus:border-ink/40"
          />
        </div>
        <button
          type="button"
          onClick={() => setPanel(true)}
          className="flex h-11 items-center gap-2 rounded-full border border-ink/12 px-4 text-[15px] lg:hidden"
        >
          <SlidersHorizontal className="size-4" /> Filters {active > 0 && <span className="rounded-full bg-red px-1.5 font-mono text-xs">{active}</span>}
        </button>
        <label className="relative ml-auto flex h-11 items-center rounded-full border border-ink/12 pl-4 pr-10 text-[15px]">
          <span className="mr-2 text-smoke">Sort</span>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value === "featured" ? null : e.target.value)}
            className="appearance-none bg-transparent font-medium outline-none"
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 size-4" />
        </label>
      </div>

      {active > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {q && <Chip label={`“${q}”`} onRemove={() => update("q", null)} />}
          {chips.map((c) => (
            <Chip key={c.key + c.value} label={c.label} onRemove={() => toggle(c.key, c.list, c.value)} />
          ))}
          {price && <Chip label={PRICES.find((p) => p.id === price)?.label ?? price} onRemove={() => update("price", null)} />}
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="px-2 text-sm text-smoke underline underline-offset-4 hover:text-ink">
            Clear all
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[230px_1fr] xl:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filters}</div>
        </aside>

        <div>
          <p className="mb-6 font-mono text-sm text-smoke" aria-live="polite">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-[28px] bg-paper px-6 py-20 text-center">
              <Mark className="h-12 w-auto" spin />
              <p className="display mt-8 text-4xl">No line like that yet.</p>
              <p className="mt-3 max-w-md text-smoke">Nobody&apos;s printed it, which means you could be first.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/studio${q ? `?text=${encodeURIComponent(q)}` : ""}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-red px-6 font-medium text-ink"
                >
                  <Sparkles className="size-4" /> {q ? `Print “${q}”` : "Design your own"}
                </Link>
                <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="h-12 rounded-full border border-ink/15 px-6">
                  Reset filters
                </button>
              </div>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {results.flatMap((p, i) => {
                  const card = (
                    <motion.div
                      key={p.slug}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ProductCard product={p} priority={i < 3} />
                    </motion.div>
                  );
                  return i === 4 && results.length > 6 ? [<StudioCard key="studio-card" />, card] : [card];
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {panel && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-bone px-6 pb-28 pt-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="display text-3xl">Filters</p>
                <button type="button" onClick={() => setPanel(false)} className="grid size-10 place-items-center rounded-full bg-paper" aria-label="Close filters">
                  <X className="size-5" />
                </button>
              </div>
              {filters}
              <div className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-bone p-4">
                <button type="button" onClick={() => setPanel(false)} className="h-13 w-full rounded-full bg-ink font-medium text-bone">
                  Show {results.length} pieces
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-4 text-smoke">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
  radio,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  radio?: boolean;
}) {
  return (
    <label className="group/row flex cursor-pointer items-center gap-3 rounded-xl py-1.5 text-[15px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "grid size-5 place-items-center border transition peer-focus-visible:ring-2 peer-focus-visible:ring-red",
          radio ? "rounded-full" : "rounded-md",
          checked ? "border-ink bg-ink text-bone" : "border-ink/25 group-hover/row:border-ink/60",
        )}
      >
        {checked && <Check className="size-3.5" />}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="font-mono text-xs text-smoke">{count}</span>}
    </label>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-full bg-ink pl-3 pr-1 text-sm text-bone">
      {label}
      <button type="button" onClick={onRemove} className="grid size-6 place-items-center rounded-full hover:bg-bone/15" aria-label={`Remove ${label}`}>
        <X className="size-3.5" />
      </button>
    </span>
  );
}

function StudioCard() {
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Link href="/studio" className="group/studio relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[22px] bg-ink p-6 text-bone">
        <Mark tone="bone" className="h-9 w-auto self-start" spin />
        <div>
          <p className="eyebrow text-bone/50">The Studio</p>
          <p className="display mt-3 text-[clamp(1.8rem,2.6vw,2.6rem)]">
            Can&apos;t find your line? <span className="serif-italic font-normal text-red">Write it.</span>
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-red px-4 py-2 text-sm font-medium text-ink">
            Open the Studio <ArrowRight className="size-4 transition group-hover/studio:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

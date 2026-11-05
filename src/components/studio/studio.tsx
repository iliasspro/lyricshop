"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileImage,
  Layers,
  Loader2,
  Redo2,
  Save,
  Shapes,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Type,
  Undo2,
  Upload,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";
import { colorFor, isDark } from "@/lib/colors";
import { hasPrint, layerId, resolveDesign, text, type Design } from "@/lib/design";
import { getProduct } from "@/lib/data/products";
import { fitLyric } from "@/lib/fit";
import { FONT_BY_ID } from "@/lib/fonts";
import { BACK_PRINT_PRICE, GARMENTS, type GarmentId } from "@/lib/garments";
import { formatPrice } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { useLibrary } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";
import { downloadBlob, exportMockup, exportPrintFile, slugify } from "@/lib/studio/export";
import { selectedLayer, useStudio, type Panel } from "@/lib/studio/store";
import { StudioCanvas } from "./canvas";
import { Inspector } from "./inspector";
import { AIPanel, BlankPanel, GraphicsPanel, LayersPanel, TextPanel, UploadPanel } from "./panels";

const DRAFT_KEY = "lyricshop-studio-draft";

const RAIL: { id: Panel; label: string; icon: typeof Type }[] = [
  { id: "blank", label: "Blank", icon: Shirt },
  { id: "text", label: "Text", icon: Type },
  { id: "graphics", label: "Graphics", icon: Shapes },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "ai", label: "AI", icon: Wand2 },
  { id: "layers", label: "Layers", icon: Layers },
];

function starter(garment: GarmentId, colorHex: string): Design {
  const ink = isDark(colorHex) ? "#F3EEE5" : "#0F0E0D";
  const area = GARMENTS[garment].views.front!.printArea;
  const f = fitLyric("your words here", "anton", { aspect: area.h / area.w, uppercase: true, maxSize: 0.3, lineHeight: 0.88 });
  return {
    front: [text({ id: layerId("t"), text: f.text, font: "anton", size: f.size, uppercase: true, lineHeight: 0.88, color: ink, y: 0.42 })],
    back: [],
  };
}

export function Studio() {
  const params = useSearchParams();
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [mobileSheet, setMobileSheet] = useState<Panel | "edit" | "bag" | null>(null);
  const [preview, setPreview] = useState<{ url: string; blob: Blob; filename: string; kind: "mockup" | "print" } | null>(null);

  const panel = useStudio((s) => s.panel);
  const garment = useStudio((s) => s.garment);
  const design = useStudio((s) => s.design);
  const name = useStudio((s) => s.name);
  const size = useStudio((s) => s.size);
  const past = useStudio((s) => s.past.length);
  const future = useStudio((s) => s.future.length);
  const selected = useStudio(selectedLayer);
  const hydrated = useUI((s) => s.hydrated);
  const { setPanel, setName, undo, redo, setSize, load } = useStudio.getState();

  const g = GARMENTS[garment];
  const backPrinted = hasPrint(design, "back");
  const price = g.basePrice + (backPrinted ? BACK_PRINT_PRICE : 0);

  /* ---------- initialise from the URL (needs the persisted library for ?design=) */
  const paramsKey = params.toString();
  const initKey = useStudio((s) => s.initKey);
  // Ready once the store holds state for this exact URL; a client-side navigation to another
  // Studio URL (e.g. "Edit" on a saved design) re-initialises automatically.
  const ready = hydrated && initKey === paramsKey;

  useEffect(() => {
    if (!hydrated || useStudio.getState().initKey === paramsKey) return;
    const done = () => useStudio.setState({ initKey: paramsKey });
    const p = Object.fromEntries(params.entries());
    const designParam = p.design;
    if (designParam) {
      const saved = useLibrary.getState().designs.find((d) => d.id === designParam);
      if (saved) {
        load({ designId: saved.id, name: saved.name, garment: saved.garment, color: saved.color, design: saved.design });
        return done();
      }
      toast.error("That saved design isn't on this device");
    }
    if (p.product) {
      const product = getProduct(p.product);
      if (product) {
        const c = p.color && product.colors.includes(p.color) ? p.color : product.colors[0];
        load({
          name: `${product.title} remix`,
          garment: product.garment,
          color: c,
          design: resolveDesign(product.design, colorFor(c).hex),
        });
        useStudio.setState({ panel: "text" });
        toast("Remixing " + product.title, { description: "Change the words, swap fonts, make it yours." });
        return done();
      }
    }
    const gParam = p.garment && p.garment in GARMENTS ? (p.garment as GarmentId) : null;
    if (p.text) {
      const gid = gParam ?? "hoodie";
      const colorId = p.color && GARMENTS[gid].colors.includes(p.color) ? p.color : GARMENTS[gid].colors[0];
      const hex = colorFor(colorId).hex;
      const fontId = p.font && FONT_BY_ID[p.font] ? p.font : "anton";
      const upper = fontId === "anton" || fontId === "bebas-neue";
      const area = GARMENTS[gid].views.front!.printArea;
      const f = fitLyric(p.text.slice(0, 80), fontId, { aspect: area.h / area.w, uppercase: upper, maxSize: 0.32 });
      load({
        name: p.text.slice(0, 40),
        garment: gid,
        color: colorId,
        design: {
          front: [text({ id: layerId("t"), text: f.text, font: fontId, size: f.size, uppercase: upper, lineHeight: upper ? 0.9 : 1, color: isDark(hex) ? "#F3EEE5" : "#0F0E0D", y: 0.42 })],
          back: [],
        },
      });
      return done();
    }
    if (gParam) {
      const c = GARMENTS[gParam].colors[0];
      load({ garment: gParam, color: c, design: starter(gParam, colorFor(c).hex) });
      return done();
    }
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
      if (draft?.garment && draft?.design) {
        load(draft);
        return done();
      }
    } catch {
      /* ignore broken drafts */
    }
    load({ garment: "hoodie", color: "black", design: starter("hoodie", colorFor("black").hex) });
    done();
  }, [hydrated, params, paramsKey, load]);

  /* ---------- autosave a draft */
  useEffect(() => {
    if (!ready) return;
    let t: ReturnType<typeof setTimeout>;
    const unsub = useStudio.subscribe((s, prev) => {
      if (s.design === prev.design && s.garment === prev.garment && s.color === prev.color && s.name === prev.name) return;
      clearTimeout(t);
      t = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ designId: s.designId, name: s.name, garment: s.garment, color: s.color, design: s.design }));
        } catch {
          /* storage full (large uploads) — skip */
        }
      }, 700);
    });
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, [ready]);

  /* ---------- actions */
  const save = useCallback(() => {
    const s = useStudio.getState();
    try {
      useLibrary.getState().saveDesign({ id: s.designId, name: s.name, garment: s.garment, color: s.color, design: s.design });
      s.markSaved();
      toast.success("Saved to your designs", { action: { label: "View", onClick: () => router.push("/account?tab=designs") } });
    } catch {
      toast.error("Couldn't save. Large uploads can exceed browser storage.");
    }
  }, [router]);

  const addToBag = useCallback(
    (chosen?: string) => {
      const s = useStudio.getState();
      const sz = chosen ?? s.size;
      if (!sz) {
        s.select(null); // shows the size picker in the summary panel
        setMobileSheet("bag");
        toast.error("Pick a size first");
        return;
      }
      if (!s.design.front.length && !s.design.back.length) {
        toast.error("Your design is empty");
        return;
      }
      const gg = GARMENTS[s.garment];
      useLibrary.getState().saveDesign({ id: s.designId, name: s.name, garment: s.garment, color: s.color, design: s.design });
      useCart.getState().add({
        kind: "custom",
        designId: s.designId,
        title: s.name && s.name !== "Untitled design" ? `${s.name} — custom ${gg.short.toLowerCase()}` : `Custom ${gg.short.toLowerCase()}`,
        garment: s.garment,
        color: s.color,
        size: sz,
        unitPrice: gg.basePrice + (hasPrint(s.design, "back") ? BACK_PRINT_PRICE : 0),
        design: structuredClone(s.design),
      });
      s.markSaved();
      useUI.getState().setCartOpen(true);
      toast.success("Your design is in the bag", { description: `${gg.name} · ${colorFor(s.color).name} · ${sz}` });
    },
    [],
  );

  const doExport = async (kind: "mockup" | "print") => {
    const svg = svgRef.current;
    if (!svg) return;
    const s = useStudio.getState();
    const t = toast.loading(kind === "mockup" ? "Rendering mockup…" : "Rendering print file…");
    try {
      const area = GARMENTS[s.garment].views[s.view]!.printArea;
      const blob = kind === "mockup" ? await exportMockup(svg, s.design) : await exportPrintFile(svg, s.design, area);
      setPreview({ url: URL.createObjectURL(blob), blob, filename: `${slugify(s.name)}-${s.view}-${kind === "mockup" ? "mockup" : "print"}.png`, kind });
      toast.dismiss(t);
    } catch {
      toast.error("Export failed", { id: t });
    }
  };

  /* ---------- keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.closest("input, textarea, select, [contenteditable=true]");
      const mod = e.metaKey || e.ctrlKey;
      const s = useStudio.getState();
      if (mod && e.key.toLowerCase() === "z") {
        if (typing) return;
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        if (typing) return;
        e.preventDefault();
        s.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
        return;
      }
      if (typing) return;
      if (mod && e.key.toLowerCase() === "d" && s.selectedId) {
        e.preventDefault();
        s.duplicateLayer(s.selectedId);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && s.selectedId) {
        e.preventDefault();
        s.removeLayer(s.selectedId);
        return;
      }
      if (e.key === "Escape") {
        s.select(null);
        return;
      }
      if (e.key.startsWith("Arrow") && s.selectedId) {
        e.preventDefault();
        const l = s.design[s.view].find((x) => x.id === s.selectedId);
        if (!l || l.locked) return;
        const step = e.shiftKey ? 0.03 : 0.005;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        s.updateLayer(l.id, { x: l.x + dx, y: l.y + dy }, { checkpoint: !e.repeat });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  // warn before leaving with unsaved work
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (useStudio.getState().dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  const addText = () => {
    const s = useStudio.getState();
    const hex = colorFor(s.color).hex;
    s.addLayer(text({ id: layerId("t"), text: "your words", font: "anton", size: 0.16, uppercase: true, color: isDark(hex) ? "#F3EEE5" : "#0F0E0D", y: 0.4 }));
    s.setPanel("text");
    s.setEditingText(true);
  };

  const panelBody = (p: Panel) =>
    p === "blank" ? <BlankPanel /> : p === "text" ? <TextPanel /> : p === "graphics" ? <GraphicsPanel /> : p === "upload" ? <UploadPanel /> : p === "ai" ? <AIPanel svgRef={svgRef} /> : <LayersPanel />;

  const summary = (
    <Summary
      price={price}
      backPrinted={backPrinted}
      size={size}
      onSize={setSize}
      onAdd={() => addToBag()}
      onSave={save}
      onExport={doExport}
    />
  );

  if (!ready) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-bone">
        <Mark className="h-14 w-auto" spin />
        <p className="eyebrow text-smoke">Warming up the press…</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bone">
      {/* top bar */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-ink/10 px-3 md:gap-4 md:px-4">
        <Link href="/" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-paper" aria-label="Back to Lyricshop">
          <ArrowLeft className="size-4" />
          <Mark className="h-5 w-auto" />
        </Link>
        <div className="hidden h-6 w-px bg-ink/10 md:block" />
        <span className="eyebrow hidden text-smoke md:inline">Studio</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          aria-label="Design name"
          className="h-9 min-w-0 max-w-[260px] flex-1 rounded-xl bg-transparent px-2 font-medium outline-none transition hover:bg-paper focus:bg-paper"
        />
        <div className="flex items-center">
          <button type="button" onClick={undo} disabled={!past} className="grid size-9 place-items-center rounded-full transition hover:bg-paper disabled:opacity-30" aria-label="Undo" title="Undo (⌘Z)">
            <Undo2 className="size-4" />
          </button>
          <button type="button" onClick={redo} disabled={!future} className="grid size-9 place-items-center rounded-full transition hover:bg-paper disabled:opacity-30" aria-label="Redo" title="Redo (⇧⌘Z)">
            <Redo2 className="size-4" />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ExportMenu onExport={doExport} />
          <button type="button" onClick={save} className="hidden h-10 items-center gap-2 rounded-full border border-ink/12 px-4 text-sm transition hover:border-ink sm:flex">
            <Save className="size-4" /> Save
          </button>
          <button
            type="button"
            onClick={() => addToBag()}
            className="flex h-10 items-center gap-2 rounded-full bg-red px-4 text-sm font-medium text-ink transition hover:bg-[#ff6a40]"
          >
            <ShoppingBag className="size-4" />
            <span className="max-sm:hidden">Add to bag ·</span> <span className="font-mono">{formatPrice(price)}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* rail */}
        <nav className="hidden w-[76px] shrink-0 flex-col items-center gap-1 border-r border-ink/10 py-3 lg:flex" aria-label="Studio tools">
          {RAIL.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className={cn(
                "relative flex w-16 flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] transition",
                panel === id ? "bg-ink text-bone" : "text-smoke hover:bg-paper hover:text-ink",
              )}
              aria-pressed={panel === id}
            >
              <Icon className="size-5" />
              {label}
              {id === "ai" && <span className="absolute right-3 top-2 size-1.5 rounded-full bg-red" />}
            </button>
          ))}
        </nav>

        {/* panel */}
        <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-r border-ink/10 lg:block" aria-label={`${panel} panel`}>
          <AnimatePresence mode="wait">
            <motion.div key={panel} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {panelBody(panel)}
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* canvas */}
        <main className="min-w-0 flex-1">
          <StudioCanvas
            svgRef={svgRef}
            onAddText={addText}
            onOpenAI={() => {
              setPanel("ai");
              setMobileSheet("ai");
            }}
          />
        </main>

        {/* inspector / summary */}
        <aside className="hidden w-[320px] shrink-0 overflow-y-auto border-l border-ink/10 xl:block" aria-label="Properties">
          {selected ? <Inspector /> : summary}
        </aside>
      </div>

      {/* mobile + tablet tabs */}
      <nav className="flex shrink-0 justify-around border-t border-ink/10 bg-bone px-1 py-1.5 xl:hidden" aria-label="Studio tools">
        {[...RAIL.map((r) => ({ id: r.id as Panel | "edit" | "bag", label: r.label, icon: r.icon })), { id: "edit" as const, label: "Edit", icon: SlidersHorizontal }, { id: "bag" as const, label: "Bag", icon: ShoppingBag }]
          .filter((r) => !(r.id === "edit" && !selected))
          .map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobileSheet(mobileSheet === id ? null : id)}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] transition",
                mobileSheet === id ? "bg-ink text-bone" : "text-smoke",
                (id === "blank" || id === "text" || id === "graphics" || id === "upload" || id === "ai" || id === "layers") && "lg:hidden",
              )}
            >
              <Icon className="size-[18px]" />
              {label}
            </button>
          ))}
      </nav>

      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Export preview">
            <motion.div
              className="absolute inset-0 bg-ink/70 backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                URL.revokeObjectURL(preview.url);
                setPreview(null);
              }}
            />
            <motion.div
              className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-bone shadow-2xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <div className={cn("aspect-square w-full p-4", preview.kind === "print" ? "checkerboard" : "bg-paper")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt="Export preview" className="h-full w-full object-contain" />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{preview.filename}</p>
                  <p className="font-mono text-xs text-smoke">{(preview.blob.size / 1024 / 1024).toFixed(1)} MB · PNG</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadBlob(preview.blob, preview.filename);
                      toast.success("Downloaded");
                    }}
                    className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bone"
                  >
                    <Download className="size-4" /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(preview.url);
                      setPreview(null);
                    }}
                    className="h-10 rounded-full bg-paper px-4 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileSheet && (
          <motion.div
            className="fixed inset-x-0 bottom-[60px] z-40 max-h-[52vh] overflow-y-auto rounded-t-[24px] border-t border-ink/10 bg-bone shadow-[0_-20px_50px_-20px_rgba(15,14,13,.35)] xl:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-bone/95 px-4 pb-1 pt-3 backdrop-blur">
              <span className="mx-auto h-1 w-10 rounded-full bg-ink/15" />
              <button type="button" onClick={() => setMobileSheet(null)} className="absolute right-3 top-2 grid size-8 place-items-center rounded-full" aria-label="Close panel">
                <ChevronDown className="size-5" />
              </button>
            </div>
            {mobileSheet === "edit" ? selected ? <Inspector /> : null : mobileSheet === "bag" ? summary : panelBody(mobileSheet)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Summary({
  price,
  backPrinted,
  size,
  onSize,
  onAdd,
  onSave,
  onExport,
}: {
  price: number;
  backPrinted: boolean;
  size: string | null;
  onSize: (s: string) => void;
  onAdd: () => void;
  onSave: () => void;
  onExport: (k: "mockup" | "print") => void;
}) {
  const garment = useStudio((s) => s.garment);
  const color = useStudio((s) => s.color);
  const design = useStudio((s) => s.design);
  const dirty = useStudio((s) => s.dirty);
  const g = GARMENTS[garment];
  const layers = design.front.length + design.back.length;

  return (
    <div>
      <div className="border-b border-ink/8 px-4 py-4">
        <p className="eyebrow text-smoke">Your piece</p>
        <p className="display mt-2 text-2xl">{g.name}</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-smoke">
          <span className="size-3.5 rounded-full border border-ink/15" style={{ background: colorFor(color).hex }} /> {colorFor(color).name} · {layers} layers
        </p>
      </div>
      <div className="border-b border-ink/8 px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow text-smoke">Size</p>
          <Link href="/help#sizing" target="_blank" className="text-[12px] underline-offset-4 hover:underline">
            Size guide
          </Link>
        </div>
        <div className={cn("grid gap-1.5", g.sizes.length > 1 ? "grid-cols-6" : "grid-cols-1")}>
          {g.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSize(s)}
              className={cn("h-10 rounded-xl border font-mono text-xs transition", size === s ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink")}
              aria-pressed={size === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <dl className="space-y-2 border-b border-ink/8 px-4 py-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-smoke">Blank + front print</dt>
          <dd className="font-mono">{formatPrice(g.basePrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-smoke">Back print</dt>
          <dd className="font-mono">{backPrinted ? formatPrice(BACK_PRINT_PRICE) : "—"}</dd>
        </div>
        <div className="flex justify-between border-t border-ink/8 pt-2 font-medium">
          <dt>Total</dt>
          <dd className="font-mono">{formatPrice(price)}</dd>
        </div>
      </dl>
      <div className="space-y-2 px-4 py-4">
        <button type="button" onClick={onAdd} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red font-medium text-ink transition hover:bg-[#ff6a40]">
          <ShoppingBag className="size-4" /> {size ? `Add to bag · ${formatPrice(price)}` : "Pick a size to continue"}
        </button>
        <button type="button" onClick={onSave} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-ink/12 text-sm transition hover:border-ink">
          {dirty ? <Save className="size-4" /> : <Check className="size-4 text-ok" />} {dirty ? "Save design" : "Saved"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onExport("mockup")} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-paper text-[12px] transition hover:bg-sand">
            <Download className="size-3.5" /> Mockup PNG
          </button>
          <button type="button" onClick={() => onExport("print")} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-paper text-[12px] transition hover:bg-sand">
            <FileImage className="size-3.5" /> Print file
          </button>
        </div>
      </div>
      <div className="mx-4 mb-6 rounded-2xl bg-paper p-4 text-[12px] leading-relaxed text-smoke">
        Printed to order on {g.fabric.split(",")[0].toLowerCase()}. Ships in 3 business days. Select a layer on the canvas to edit it.
      </div>
    </div>
  );
}

function ExportMenu({ onExport }: { onExport: (k: "mockup" | "print") => void }) {
  const [open, setOpen] = useState(false);
  const [busy] = useState(false);
  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-full px-3 text-sm transition hover:bg-paper"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Export
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl bg-bone p-1.5 shadow-2xl ring-1 ring-ink/10"
            onMouseLeave={() => setOpen(false)}
          >
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onExport("mockup");
              }}
              className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm hover:bg-paper"
            >
              Mockup PNG <span className="text-[11px] text-smoke">2000 px, for sharing</span>
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onExport("print");
              }}
              className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm hover:bg-paper"
            >
              Print-ready PNG <span className="text-[11px] text-smoke">3600 px, transparent</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

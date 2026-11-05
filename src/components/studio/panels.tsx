"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  LockOpen,
  Plus,
  RotateCcw,
  Shapes,
  Trash2,
  Type,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";
import { Mark } from "@/components/brand/logo";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { PrintLayer } from "@/components/garment/print-layer";
import { cn } from "@/lib/cn";
import { colorFor, isDark } from "@/lib/colors";
import { graphic, layerId, layerLabel, resolveLayers, text, type ImageLayer, type Layer } from "@/lib/design";
import { fitLyric } from "@/lib/fit";
import { fontFor } from "@/lib/fonts";
import { GARMENT_LIST, GARMENTS } from "@/lib/garments";
import { GRAPHICS, type GraphicCategory } from "@/lib/graphics";
import { blobToDataURL, downloadBlob, exportMockup, slugify } from "@/lib/studio/export";
import { normaliseImage, readFileAsDataURL, removeBackground } from "@/lib/studio/image-tools";
import { PRESETS } from "@/lib/studio/presets";
import { useStudio } from "@/lib/studio/store";
import { ColorField, Section } from "./controls";

const inkFor = (hex: string) => (isDark(hex) ? "#F3EEE5" : "#0F0E0D");

function useInk() {
  const color = useStudio((s) => s.color);
  const hex = colorFor(color).hex;
  return { hex, ink: inkFor(hex), accent: "#FF4A1C" };
}

/* ------------------------------------------------------------------ Blank */

export function BlankPanel() {
  const garment = useStudio((s) => s.garment);
  const color = useStudio((s) => s.color);
  const view = useStudio((s) => s.view);
  const design = useStudio((s) => s.design);
  const { setGarment, setColor, setView, clearView } = useStudio.getState();
  const g = GARMENTS[garment];

  return (
    <>
      <Section title="Pick a blank">
        <div className="grid grid-cols-2 gap-2">
          {GARMENT_LIST.map((item) => {
            const c = item.colors.includes(color) ? color : item.colors[0];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGarment(item.id)}
                className={cn(
                  "group/blank rounded-2xl p-2 text-left transition",
                  garment === item.id ? "bg-ink text-bone" : "bg-paper hover:bg-sand",
                )}
                aria-pressed={garment === item.id}
              >
                <span className="block aspect-square rounded-xl bg-bone/60 p-1">
                  <GarmentMockup garment={item.id} color={colorFor(c).hex} layers={design.front} shadow={false} className="h-full w-full" />
                </span>
                <span className="mt-2 block px-1 text-[13px] font-medium">{item.short}</span>
                <span className={cn("block px-1 font-mono text-[11px]", garment === item.id ? "text-bone/60" : "text-smoke")}>from ${item.basePrice}</span>
              </button>
            );
          })}
        </div>
      </Section>
      <Section title={`Color · ${colorFor(color).name}`}>
        <div className="grid grid-cols-6 gap-2">
          {g.colors.map((id) => {
            const c = colorFor(id);
            return (
              <button
                key={id}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={color === id}
                onClick={() => setColor(id)}
                className={cn(
                  "aspect-square rounded-xl border border-ink/12 ring-offset-2 ring-offset-bone transition",
                  color === id ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-ink/25",
                )}
                style={{ background: c.hex }}
              />
            );
          })}
        </div>
      </Section>
      {g.views.back && (
        <Section title="Print side">
          <div className="grid grid-cols-2 gap-2">
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn("rounded-xl px-3 py-2.5 text-left text-sm capitalize transition", view === v ? "bg-ink text-bone" : "bg-paper hover:bg-sand")}
              >
                {v}
                <span className={cn("block font-mono text-[11px]", view === v ? "text-bone/60" : "text-smoke")}>
                  {v === "front" ? "included" : "+ $8"} · {design[v].length} layers
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}
      <Section title="Blank details">
        <p className="text-[13px] font-medium">{g.name}</p>
        <p className="mt-1 text-[13px] text-smoke">{g.fabric}</p>
        <p className="mt-1 text-[13px] text-smoke">{g.fit}</p>
        {design[view].length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearView();
              toast("Cleared the " + view, { action: { label: "Undo", onClick: () => useStudio.getState().undo() } });
            }}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-smoke underline-offset-4 hover:text-red hover:underline"
          >
            <RotateCcw className="size-3.5" /> Clear the {view}
          </button>
        )}
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ Text */

export function TextPanel() {
  const { ink, accent } = useInk();
  const garment = useStudio((s) => s.garment);
  const view = useStudio((s) => s.view);
  const { addLayer, checkpoint } = useStudio.getState();
  const area = GARMENTS[garment].views[view]?.printArea ?? GARMENTS[garment].views.front!.printArea;
  const aspect = area.h / area.w;
  const [line, setLine] = useState("loud in a quiet room");

  const addStyle = (kind: "headline" | "script" | "small") => {
    const base = line.trim() || "your words here";
    if (kind === "headline") {
      const f = fitLyric(base, "anton", { aspect, uppercase: true, maxSize: 0.3, lineHeight: 0.9 });
      addLayer(text({ id: layerId("t"), text: f.text, font: "anton", size: f.size, uppercase: true, lineHeight: 0.9, color: ink, y: 0.4 }));
    } else if (kind === "script") {
      const f = fitLyric(base, "yellowtail", { aspect, maxSize: 0.18 });
      addLayer(text({ id: layerId("t"), text: f.text, font: "yellowtail", size: f.size, color: ink, y: 0.4, rotation: -4 }));
    } else {
      addLayer(text({ id: layerId("t"), text: base, font: "space-mono", size: 0.05, color: ink, y: 0.12, letterSpacing: 0.08 }));
    }
  };

  return (
    <>
      <Section title="Your line">
        <textarea
          value={line}
          onChange={(e) => setLine(e.target.value.slice(0, 140))}
          rows={2}
          placeholder="Type the line stuck in your head…"
          className="w-full resize-none rounded-2xl border border-ink/12 bg-white/60 p-3 text-[15px] outline-none transition focus:border-ink/40"
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => addStyle("headline")} className="rounded-xl bg-paper px-2 py-3 text-center transition hover:bg-sand">
            <span className="block text-xl leading-none" style={{ fontFamily: '"ls-anton"' }}>
              BIG
            </span>
            <span className="mt-1 block text-[11px] text-smoke">Headline</span>
          </button>
          <button type="button" onClick={() => addStyle("script")} className="rounded-xl bg-paper px-2 py-3 text-center transition hover:bg-sand">
            <span className="block text-xl leading-none" style={{ fontFamily: '"ls-yellowtail"' }}>
              Script
            </span>
            <span className="mt-1 block text-[11px] text-smoke">Signature</span>
          </button>
          <button type="button" onClick={() => addStyle("small")} className="rounded-xl bg-paper px-2 py-3 text-center transition hover:bg-sand">
            <span className="block text-sm leading-6" style={{ fontFamily: '"ls-space-mono"' }}>
              small
            </span>
            <span className="mt-1 block text-[11px] text-smoke">Caption</span>
          </button>
        </div>
      </Section>
      <Section title="Lyric layouts" aside={<span className="text-[11px] text-smoke">replaces this side</span>}>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => {
            const layers = p.build(line.trim() || "your words here", ink, accent, aspect);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  checkpoint();
                  const s = useStudio.getState();
                  useStudio.setState({ design: { ...s.design, [s.view]: layers }, selectedId: layers[layers.length - 1]?.id ?? null, dirty: true });
                  toast(`${p.name} layout applied`, { action: { label: "Undo", onClick: () => useStudio.getState().undo() } });
                }}
                className="group/preset rounded-2xl bg-paper p-2 text-left transition hover:bg-sand"
              >
                <span className="block aspect-square overflow-hidden rounded-xl">
                  <PresetPreview layers={layers} />
                </span>
                <span className="mt-2 block px-1 text-[13px] font-medium">{p.name}</span>
                <span className="block px-1 text-[11px] text-smoke">{p.hint}</span>
              </button>
            );
          })}
        </div>
      </Section>
    </>
  );
}

/** Just the print area: legible at thumbnail size, unlike a whole-garment mockup. */
function PresetPreview({ layers }: { layers: Layer[] }) {
  const garment = useStudio((s) => s.garment);
  const view = useStudio((s) => s.view);
  const color = useStudio((s) => s.color);
  const raw = useId();
  const id = `pp${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const pa = (GARMENTS[garment].views[view] ?? GARMENTS[garment].views.front!).printArea;
  const hex = colorFor(color).hex;
  const pad = pa.w * 0.08;
  return (
    <svg viewBox={`${-pad} ${-pad} ${pa.w + pad * 2} ${pa.h + pad * 2}`} className="h-full w-full" aria-hidden>
      <rect x={-pad} y={-pad} width={pa.w + pad * 2} height={pa.h + pad * 2} fill={hex} />
      {resolveLayers(layers, hex).map((l) => (
        <PrintLayer key={l.id} layer={l} W={pa.w} H={pa.h} idPrefix={id} />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ Graphics */

export function GraphicsPanel() {
  const { ink, accent } = useInk();
  const garmentColor = useStudio((s) => s.color);
  const [cat, setCat] = useState<GraphicCategory>("Music");
  const [color, setColor] = useState<string | null>(null);
  const addLayer = useStudio((s) => s.addLayer);
  // red ink disappears on red cloth, so fall back to the contrast ink there
  const fill = color ?? (garmentColor === "red" || garmentColor === "burgundy" ? ink : accent);

  return (
    <>
      <Section>
        <div className="flex rounded-xl bg-paper p-1">
          {(["Music", "Symbols", "Shapes"] as GraphicCategory[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn("h-8 flex-1 rounded-lg text-[13px] transition", cat === c ? "bg-ink text-bone" : "hover:bg-sand")}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {GRAPHICS.filter((x) => x.category === cat).map((x) => (
            <button
              key={x.id}
              type="button"
              title={x.name}
              aria-label={`Add ${x.name}`}
              onClick={() => addLayer(graphic({ id: layerId("g"), graphic: x.id, color: fill, size: x.category === "Shapes" ? 0.6 : 0.3, y: 0.45 }))}
              className="group/g grid aspect-square place-items-center rounded-xl bg-paper p-3 transition hover:bg-sand"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full transition group-hover/g:scale-110">
                <path d={x.d} fill={fill} fillRule={x.fillRule} />
              </svg>
            </button>
          ))}
        </div>
      </Section>
      <Section>
        <ColorField label="Ink for new graphics" value={fill} onChange={setColor} />
        <button type="button" onClick={() => setColor(ink)} className="mt-3 text-[12px] text-smoke underline-offset-4 hover:underline">
          Match the garment&apos;s contrast ink
        </button>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ Upload */

export function UploadPanel() {
  const addLayer = useStudio((s) => s.addLayer);
  const [busy, setBusy] = useState(false);
  const [knockout, setKnockout] = useState(true);
  const [recent, setRecent] = useState<{ src: string; aspect: number; name: string }[]>([]);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) {
      toast.error("Use a PNG, JPG, WebP or SVG");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("That file is over 12 MB");
      return;
    }
    setBusy(true);
    try {
      const raw = await readFileAsDataURL(file);
      const normalised = await normaliseImage(raw);
      const aspect = normalised.aspect;
      let src = normalised.src;
      if (knockout && file.type !== "image/svg+xml") src = await removeBackground(src);
      const item = { src, aspect, name: file.name.replace(/\.[^.]+$/, "").slice(0, 24) };
      setRecent((r) => [item, ...r].slice(0, 8));
      addLayer({ id: layerId("i"), type: "image", src, aspect, size: 0.6, x: 0.5, y: 0.45, rotation: 0, opacity: 1, name: item.name } satisfies ImageLayer);
      toast.success("Image added", { description: knockout ? "Background removed. Toggle it off for photos." : undefined });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Section title="Upload artwork">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handle(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition",
            drag ? "border-red bg-red/5" : "border-ink/20 hover:border-ink/50",
          )}
        >
          {busy ? <Loader2 className="size-7 animate-spin" /> : <Upload className="size-7" />}
          <span className="mt-3 font-medium">{busy ? "Processing…" : "Drop an image or browse"}</span>
          <span className="mt-1 text-[12px] text-smoke">PNG, JPG, WebP or SVG · up to 12 MB</span>
        </button>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-[13px]">
          <input type="checkbox" checked={knockout} onChange={(e) => setKnockout(e.target.checked)} className="mt-0.5 size-4 accent-[#0f0e0d]" />
          <span>
            Remove flat backgrounds automatically
            <span className="block text-[12px] text-smoke">Great for logos and drawings on white paper.</span>
          </span>
        </label>
      </Section>
      {recent.length > 0 && (
        <Section title="This session">
          <div className="grid grid-cols-3 gap-2">
            {recent.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => addLayer({ id: layerId("i"), type: "image", src: r.src, aspect: r.aspect, size: 0.5, x: 0.5, y: 0.45, rotation: 0, opacity: 1, name: r.name })}
                className="checkerboard relative aspect-square overflow-hidden rounded-xl"
                title={`Add ${r.name} again`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.src} alt="" className="h-full w-full object-contain p-1" />
              </button>
            ))}
          </div>
        </Section>
      )}
      <Section title="Print tips">
        <ul className="space-y-1.5 text-[12px] text-smoke">
          <li>• 300 dpi at print size keeps edges crisp.</li>
          <li>• Transparent PNGs give the cleanest result.</li>
          <li>• Only upload artwork you own or have rights to.</li>
        </ul>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ AI (Nano Banana Pro) */

const STYLES = [
  { id: "screenprint", label: "Screen print" },
  { id: "tattoo", label: "Tattoo flash" },
  { id: "lineart", label: "Line art" },
  { id: "halftone", label: "Halftone poster" },
  { id: "woodcut", label: "Woodcut" },
  { id: "riso", label: "Risograph" },
  { id: "chrome", label: "Y2K chrome" },
  { id: "sticker", label: "Sticker" },
];

const SCENES = [
  { id: "rooftop", label: "Rooftop, blue hour" },
  { id: "record-store", label: "Record store" },
  { id: "studio", label: "Studio portrait" },
  { id: "street", label: "Neon street" },
];

const IDEAS = [
  "a cassette tape with roses growing out of the reels",
  "a burning vinyl record with wings",
  "a hand holding a microphone wrapped in thorns",
  "a crescent moon wearing headphones",
  "a lighthouse made of stacked speakers",
];

type AIResult = { id: string; src: string; prompt: string };

async function callApi(path: string, body: unknown): Promise<{ image?: string; error?: string; message?: string; status: number }> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  return { ...json, status: res.status };
}

export function AIPanel({ svgRef }: { svgRef: RefObject<SVGSVGElement | null> }) {
  const addLayer = useStudio((s) => s.addLayer);
  const garment = useStudio((s) => s.garment);
  const color = useStudio((s) => s.color);
  const design = useStudio((s) => s.design);
  const name = useStudio((s) => s.name);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("screenprint");
  const [knockout, setKnockout] = useState(true);
  const [busy, setBusy] = useState<"graphic" | "photo" | null>(null);
  const [results, setResults] = useState<AIResult[]>([]);
  const [setup, setSetup] = useState<string | null>(null);
  const [scene, setScene] = useState("rooftop");
  const [photo, setPhoto] = useState<string | null>(null);

  const generate = async () => {
    const p = prompt.trim();
    if (p.length < 3) {
      toast.error("Describe the graphic in a few words");
      return;
    }
    setBusy("graphic");
    try {
      const r = await callApi("/api/generate", { prompt: p, style });
      if (r.status === 501) {
        setSetup(r.message ?? "Nano Banana Pro isn't connected yet.");
        return;
      }
      if (!r.image) throw new Error(r.message ?? "Generation failed. Try again.");
      const normalised = await normaliseImage(r.image, 1400);
      const aspect = normalised.aspect;
      let src = normalised.src;
      if (knockout) src = await removeBackground(src, 46);
      const item = { id: layerId("ai"), src, prompt: p };
      setResults((list) => [item, ...list].slice(0, 12));
      addLayer({ id: layerId("i"), type: "image", src, aspect, size: 0.7, x: 0.5, y: 0.45, rotation: 0, opacity: 1, name: p.slice(0, 24) });
      toast.success("Fresh off Nano Banana Pro", { description: "Added to your design." });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  };

  const shoot = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    if (!design.front.length && !design.back.length) {
      toast.error("Add something to your design first");
      return;
    }
    setBusy("photo");
    try {
      const blob = await exportMockup(svg, design, { size: 1200, background: "#F3EEE5" });
      const mockup = await blobToDataURL(blob);
      const r = await callApi("/api/photoshoot", { image: mockup, garment: GARMENTS[garment].name, color: colorFor(color).name, scene });
      if (r.status === 501) {
        setSetup(r.message ?? "Nano Banana Pro isn't connected yet.");
        return;
      }
      if (!r.image) throw new Error(r.message ?? "The photoshoot didn't develop. Try again.");
      setPhoto(r.image);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Photoshoot failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Section>
        <div className="flex items-center gap-3 rounded-2xl bg-ink p-3 text-bone">
          <span className="grid size-10 place-items-center rounded-xl bg-tape text-xl" aria-hidden>
            🍌
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">Nano Banana Pro</p>
            <p className="text-[12px] text-bone/60">Google&apos;s image model, generating print-ready art</p>
          </div>
        </div>
      </Section>

      {setup && (
        <Section>
          <div className="rounded-2xl border border-red/40 bg-red/5 p-4 text-[13px]">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">Connect Nano Banana Pro</p>
              <button type="button" onClick={() => setSetup(null)} aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-smoke">{setup}</p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-3 font-mono text-[11px] text-bone">GEMINI_API_KEY=your-key</pre>
            <p className="mt-2 text-[12px] text-smoke">Add it to .env.local, restart the dev server, and generate again.</p>
          </div>
        </Section>
      )}

      <Section title="Generate a graphic">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, 400))}
          rows={3}
          placeholder="Describe it: a cassette tape with roses growing out of the reels…"
          className="w-full resize-none rounded-2xl border border-ink/12 bg-white/60 p-3 text-[14px] outline-none transition focus:border-ink/40"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
          }}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {IDEAS.slice(0, 3).map((idea) => (
            <button key={idea} type="button" onClick={() => setPrompt(idea)} className="rounded-full bg-paper px-2.5 py-1 text-[11px] text-smoke transition hover:bg-sand hover:text-ink">
              {idea.split(" ").slice(0, 4).join(" ")}…
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-[13px]">Style</p>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className={cn("h-8 rounded-full px-3 text-[12px] transition", style === s.id ? "bg-ink text-bone" : "bg-paper hover:bg-sand")}
              aria-pressed={style === s.id}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-[13px]">
          <input type="checkbox" checked={knockout} onChange={(e) => setKnockout(e.target.checked)} className="size-4 accent-[#0f0e0d]" />
          Remove the background
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={!!busy}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red font-medium text-ink transition hover:bg-[#ff6a40] disabled:opacity-60"
        >
          {busy === "graphic" ? (
            <>
              <Mark className="h-4 w-auto" detail={false} spin /> Pressing your graphic…
            </>
          ) : (
            <>
              <Wand2 className="size-4" /> Generate
            </>
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-smoke">⌘ + Enter to generate · takes 10–30 seconds</p>
      </Section>

      {results.length > 0 && (
        <Section title="Generated">
          <div className="grid grid-cols-3 gap-2">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                title={r.prompt}
                onClick={() => addLayer({ id: layerId("i"), type: "image", src: r.src, aspect: 1, size: 0.6, x: 0.5, y: 0.45, rotation: 0, opacity: 1, name: r.prompt.slice(0, 24) })}
                className="checkerboard relative aspect-square overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.src} alt={r.prompt} className="h-full w-full object-contain" />
                <span className="absolute bottom-1 right-1 grid size-6 place-items-center rounded-full bg-ink text-bone">
                  <Plus className="size-3.5" />
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="See it worn">
        <p className="text-[13px] text-smoke">Nano Banana Pro puts your exact design on a model, so you can see it before you buy.</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScene(s.id)}
              className={cn("rounded-xl px-3 py-2 text-left text-[12px] transition", scene === s.id ? "bg-ink text-bone" : "bg-paper hover:bg-sand")}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={shoot}
          disabled={!!busy}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-medium text-bone transition hover:bg-ink-3 disabled:opacity-60"
        >
          {busy === "photo" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Developing the photo…
            </>
          ) : (
            <>
              <Camera className="size-4" /> Run the photoshoot
            </>
          )}
        </button>
      </Section>

      <AnimatePresence>
        {photo && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Photoshoot result">
            <motion.div className="absolute inset-0 bg-ink/70 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPhoto(null)} />
            <motion.div
              className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-[28px] bg-bone shadow-2xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image src={photo} alt="AI photoshoot of your design" fill unoptimized className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-sm text-smoke">Generated preview · colors may vary slightly</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const blob = await (await fetch(photo)).blob();
                      downloadBlob(blob, `${slugify(name)}-photoshoot.png`);
                    }}
                    className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bone"
                  >
                    <Download className="size-4" /> Save
                  </button>
                  <button type="button" onClick={() => setPhoto(null)} className="grid size-10 place-items-center rounded-full bg-paper" aria-label="Close">
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ Layers */

export function LayersPanel() {
  const view = useStudio((s) => s.view);
  const layers = useStudio((s) => s.design[s.view]);
  const selectedId = useStudio((s) => s.selectedId);
  const { select, updateLayer, moveLayer, removeLayer } = useStudio.getState();
  const ordered = [...layers].reverse();

  if (!layers.length) {
    return (
      <Section>
        <div className="py-8 text-center text-[13px] text-smoke">
          <ImagePlus className="mx-auto mb-3 size-6" />
          Nothing on the {view} yet.
        </div>
      </Section>
    );
  }

  return (
    <Section title={`${layers.length} layers · ${view}`}>
      <ul className="space-y-1.5">
        {ordered.map((l, i) => (
          <li key={l.id}>
            <div
              className={cn(
                "group/layer flex items-center gap-2 rounded-xl p-1.5 pr-1 transition",
                selectedId === l.id ? "bg-ink text-bone" : "bg-paper hover:bg-sand",
              )}
            >
              <button type="button" onClick={() => select(l.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <LayerIcon layer={l} />
                <span className={cn("truncate text-[13px]", l.hidden && "opacity-50")}>{layerLabel(l)}</span>
              </button>
              <IconBtn title={l.hidden ? "Show" : "Hide"} onClick={() => updateLayer(l.id, { hidden: !l.hidden }, { checkpoint: true })}>
                {l.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </IconBtn>
              <IconBtn title={l.locked ? "Unlock" : "Lock"} onClick={() => updateLayer(l.id, { locked: !l.locked }, { checkpoint: true })}>
                {l.locked ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
              </IconBtn>
              <IconBtn title="Bring forward" disabled={i === 0} onClick={() => moveLayer(l.id, "up")}>
                <ArrowUp className="size-3.5" />
              </IconBtn>
              <IconBtn title="Send backward" disabled={i === ordered.length - 1} onClick={() => moveLayer(l.id, "down")}>
                <ArrowDown className="size-3.5" />
              </IconBtn>
              <IconBtn title="Delete" onClick={() => removeLayer(l.id)}>
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function IconBtn({ children, title, onClick, disabled }: { children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 shrink-0 place-items-center rounded-lg opacity-60 transition hover:bg-current/10 hover:opacity-100 disabled:opacity-20"
    >
      {children}
    </button>
  );
}

function LayerIcon({ layer }: { layer: Layer }) {
  const cls = "grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-bone/90 text-ink";
  if (layer.type === "text") {
    const f = fontFor(layer.font);
    return (
      <span className={cls} style={{ fontFamily: `"${f.family}"`, color: layer.color === "#F3EEE5" ? "#0F0E0D" : layer.color }}>
        Aa
      </span>
    );
  }
  if (layer.type === "graphic") {
    const art = GRAPHICS.find((x) => x.id === layer.graphic);
    return (
      <span className={cls}>
        <svg viewBox="0 0 100 100" className="size-5">
          <path d={art?.d} fill={layer.color === "#F3EEE5" ? "#0F0E0D" : layer.color} fillRule={art?.fillRule} />
        </svg>
      </span>
    );
  }
  return (
    <span className={cn(cls, "checkerboard")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={layer.src} alt="" className="h-full w-full object-contain" />
    </span>
  );
}

export const PANEL_META = {
  blank: { label: "Blank", icon: Shapes },
  text: { label: "Text", icon: Type },
  graphics: { label: "Graphics", icon: Shapes },
  upload: { label: "Upload", icon: Upload },
  ai: { label: "AI", icon: Wand2 },
  layers: { label: "Layers", icon: Eye },
} as const;

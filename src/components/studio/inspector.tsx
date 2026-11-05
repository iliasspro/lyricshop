"use client";

import {
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  ArrowDownToLine,
  ArrowUpToLine,
  CaseUpper,
  Copy,
  FlipHorizontal2,
  Lock,
  LockOpen,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import type { GraphicLayer, ImageLayer, Layer, TextLayer } from "@/lib/design";
import { DESIGN_FONTS, FONT_CATEGORIES, fontFor, type FontCategory } from "@/lib/fonts";
import { GRAPHICS } from "@/lib/graphics";
import { removeBackground } from "@/lib/studio/image-tools";
import { selectedLayer, useStudio } from "@/lib/studio/store";
import { ColorField, Section, Segmented, Slider, ToolButton } from "./controls";

export function Inspector() {
  const layer = useStudio(selectedLayer);
  if (!layer) return null;
  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
        <p className="eyebrow text-smoke">
          {layer.type === "text" ? "Text" : layer.type === "graphic" ? "Graphic" : "Image"} layer
        </p>
        <LayerActions layer={layer} />
      </div>
      {layer.type === "text" && <TextControls layer={layer} />}
      {layer.type === "graphic" && <GraphicControls layer={layer} />}
      {layer.type === "image" && <ImageControls layer={layer} />}
      <CommonControls layer={layer} />
    </div>
  );
}

function useEdit(id: string) {
  const { updateLayer, checkpoint } = useStudio.getState();
  return {
    set: (patch: Partial<Layer>) => updateLayer(id, patch),
    commit: (patch: Partial<Layer>) => updateLayer(id, patch, { checkpoint: true }),
    begin: checkpoint,
  };
}

function LayerActions({ layer }: { layer: Layer }) {
  const { duplicateLayer, removeLayer, updateLayer } = useStudio.getState();
  return (
    <div className="flex items-center gap-0.5">
      <ToolButton title={layer.locked ? "Unlock" : "Lock"} onClick={() => updateLayer(layer.id, { locked: !layer.locked }, { checkpoint: true })} active={layer.locked}>
        {layer.locked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
      </ToolButton>
      <ToolButton title="Duplicate (⌘D)" onClick={() => duplicateLayer(layer.id)}>
        <Copy className="size-4" />
      </ToolButton>
      <ToolButton
        title="Delete (⌫)"
        onClick={() => {
          removeLayer(layer.id);
          toast("Layer deleted", { action: { label: "Undo", onClick: () => useStudio.getState().undo() } });
        }}
        className="hover:text-red"
      >
        <Trash2 className="size-4" />
      </ToolButton>
    </div>
  );
}

function TextControls({ layer }: { layer: TextLayer }) {
  const { set, commit, begin } = useEdit(layer.id);
  const editing = useStudio((s) => s.editingText);
  const setEditing = useStudio((s) => s.setEditingText);
  const ref = useRef<HTMLTextAreaElement>(null);
  // the category tab follows the layer's font unless the user picked another tab for it
  const [pick, setPick] = useState<{ font: string; cat: FontCategory } | null>(null);
  const cat = pick && pick.font === layer.font ? pick.cat : fontFor(layer.font).category;
  const setCat = (c: FontCategory) => setPick({ font: layer.font, cat: c });
  const began = useRef(false);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
      setEditing(false);
    }
  }, [editing, setEditing]);

  return (
    <>
      <Section title="Words">
        <textarea
          ref={ref}
          value={layer.text}
          rows={Math.min(5, Math.max(2, layer.text.split("\n").length))}
          onFocus={() => (began.current = false)}
          onChange={(e) => {
            if (!began.current) {
              begin();
              began.current = true;
            }
            set({ text: e.target.value.slice(0, 200) });
          }}
          className="w-full resize-none rounded-2xl border border-ink/12 bg-white/60 p-3 text-[15px] leading-snug outline-none transition focus:border-ink/40"
          aria-label="Text content"
        />
        <p className="mt-1.5 text-[11px] text-smoke">Enter for a new line · curved text uses one line</p>
      </Section>

      <Section title="Typeface" aside={<span className="font-mono text-[11px] text-smoke">{fontFor(layer.font).label}</span>}>
        <div className="no-scrollbar -mx-1 mb-3 flex gap-1 overflow-x-auto px-1">
          {FONT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn("h-7 shrink-0 rounded-full px-2.5 text-[11px] transition", cat === c ? "bg-ink text-bone" : "bg-paper hover:bg-sand")}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {DESIGN_FONTS.filter((f) => f.category === cat).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => commit({ font: f.id })}
              className={cn(
                "truncate rounded-xl px-3 py-2.5 text-left text-[17px] leading-tight transition",
                layer.font === f.id ? "bg-ink text-bone" : "bg-paper hover:bg-sand",
              )}
              style={{ fontFamily: `"${f.family}"`, fontWeight: f.weight, fontStyle: f.style }}
              title={f.label}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Style">
        <div className="space-y-4">
          <Slider label="Size" value={layer.size} min={0.03} max={0.6} step={0.005} onStart={begin} onChange={(v) => set({ size: v })} format={(v) => `${Math.round(v * 100)}`} />
          <Slider
            label="Curve"
            value={layer.curve}
            min={-100}
            max={100}
            step={1}
            onStart={begin}
            onChange={(v) => set({ curve: Math.abs(v) < 3 ? 0 : v })}
            format={(v) => (v === 0 ? "straight" : v > 0 ? `arch ${v}` : `smile ${-v}`)}
          />
          <Slider label="Letter spacing" value={layer.letterSpacing} min={-0.1} max={0.5} step={0.005} onStart={begin} onChange={(v) => set({ letterSpacing: v })} format={(v) => v.toFixed(2)} />
          {!layer.curve && (
            <Slider label="Line height" value={layer.lineHeight} min={0.7} max={2} step={0.01} onStart={begin} onChange={(v) => set({ lineHeight: v })} format={(v) => v.toFixed(2)} />
          )}
          <div className="flex items-center gap-2">
            <Segmented
              className="flex-1"
              value={layer.align}
              onChange={(v) => commit({ align: v })}
              options={[
                { value: "left", label: <AlignLeft className="size-4" />, title: "Align left" },
                { value: "center", label: <AlignCenter className="size-4" />, title: "Align center" },
                { value: "right", label: <AlignRight className="size-4" />, title: "Align right" },
              ]}
            />
            <ToolButton title="All caps" active={!!layer.uppercase} onClick={() => commit({ uppercase: !layer.uppercase })}>
              <CaseUpper className="size-4" />
            </ToolButton>
          </div>
        </div>
      </Section>

      <Section title="Ink">
        <ColorField value={layer.color} onStart={begin} onChange={(c) => set({ color: c })} />
      </Section>

      <Section
        title="Outline"
        aside={
          <button
            type="button"
            role="switch"
            aria-checked={!!layer.strokeWidth}
            onClick={() => commit(layer.strokeWidth ? { strokeWidth: 0 } : { strokeWidth: 0.06, strokeColor: layer.strokeColor ?? "#FF4A1C" })}
            className={cn("relative h-6 w-10 rounded-full transition", layer.strokeWidth ? "bg-ink" : "bg-sand")}
            aria-label="Toggle outline"
          >
            <span className={cn("absolute top-1 size-4 rounded-full bg-bone transition-all", layer.strokeWidth ? "left-5" : "left-1")} />
          </button>
        }
      >
        {layer.strokeWidth ? (
          <div className="space-y-4">
            <Slider label="Weight" value={layer.strokeWidth} min={0.01} max={0.2} step={0.005} onStart={begin} onChange={(v) => set({ strokeWidth: v })} format={(v) => v.toFixed(2)} />
            <ColorField label="Outline color" value={layer.strokeColor ?? "#FF4A1C"} onStart={begin} onChange={(c) => set({ strokeColor: c })} />
          </div>
        ) : (
          <p className="text-[12px] text-smoke">Add a contrasting edge, great on busy colorways.</p>
        )}
      </Section>
    </>
  );
}

function GraphicControls({ layer }: { layer: GraphicLayer }) {
  const { set, commit, begin } = useEdit(layer.id);
  return (
    <>
      <Section title="Graphic">
        <div className="grid grid-cols-6 gap-1.5">
          {GRAPHICS.map((g) => (
            <button
              key={g.id}
              type="button"
              title={g.name}
              aria-label={g.name}
              onClick={() => commit({ graphic: g.id })}
              className={cn("grid aspect-square place-items-center rounded-lg p-1.5 transition", layer.graphic === g.id ? "bg-ink" : "bg-paper hover:bg-sand")}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <path d={g.d} fill={layer.graphic === g.id ? "#F3EEE5" : "#0F0E0D"} fillRule={g.fillRule} />
              </svg>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Style">
        <Slider label="Size" value={layer.size} min={0.03} max={1.4} step={0.005} onStart={begin} onChange={(v) => set({ size: v })} format={(v) => `${Math.round(v * 100)}`} />
      </Section>
      <Section title="Ink">
        <ColorField value={layer.color} onStart={begin} onChange={(c) => set({ color: c })} />
      </Section>
    </>
  );
}

function ImageControls({ layer }: { layer: ImageLayer }) {
  const { set, commit, begin } = useEdit(layer.id);
  const [busy, setBusy] = useState(false);
  return (
    <Section title="Image">
      <Slider label="Size" value={layer.size} min={0.05} max={1.6} step={0.005} onStart={begin} onChange={(v) => set({ size: v })} format={(v) => `${Math.round(v * 100)}`} />
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            commit({ src: await removeBackground(layer.src, 48) });
            toast.success("Background knocked out");
          } catch {
            toast.error("Couldn't remove the background");
          } finally {
            setBusy(false);
          }
        }}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-paper text-[13px] transition hover:bg-sand disabled:opacity-50"
      >
        <Wand2 className="size-4" /> {busy ? "Working…" : "Remove background"}
      </button>
    </Section>
  );
}

function CommonControls({ layer }: { layer: Layer }) {
  const { set, commit, begin } = useEdit(layer.id);
  const moveLayer = useStudio((s) => s.moveLayer);
  return (
    <Section title="Arrange">
      <div className="space-y-4">
        <Slider
          label="Rotation"
          value={layer.rotation}
          min={-180}
          max={180}
          step={1}
          onStart={begin}
          onChange={(v) => set({ rotation: Math.abs(v) < 2 ? 0 : v })}
          format={(v) => `${Math.round(v)}°`}
        />
        <Slider label="Opacity" value={layer.opacity} min={0.05} max={1} step={0.01} onStart={begin} onChange={(v) => set({ opacity: v })} format={(v) => `${Math.round(v * 100)}%`} />
        <div className="grid grid-cols-5 gap-1">
          <ToolButton title="Center horizontally" onClick={() => commit({ x: 0.5 })}>
            <AlignHorizontalJustifyCenter className="size-4" />
          </ToolButton>
          <ToolButton title="Center vertically" onClick={() => commit({ y: 0.5 })}>
            <AlignVerticalJustifyCenter className="size-4" />
          </ToolButton>
          <ToolButton title="Flip horizontally" active={!!layer.flipX} onClick={() => commit({ flipX: !layer.flipX })}>
            <FlipHorizontal2 className="size-4" />
          </ToolButton>
          <ToolButton title="Bring to front" onClick={() => moveLayer(layer.id, "top")}>
            <ArrowUpToLine className="size-4" />
          </ToolButton>
          <ToolButton title="Send to back" onClick={() => moveLayer(layer.id, "bottom")}>
            <ArrowDownToLine className="size-4" />
          </ToolButton>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-smoke">
          <Sparkles className="size-3 text-red" /> Arrow keys nudge · Shift for bigger steps
        </p>
      </div>
    </Section>
  );
}

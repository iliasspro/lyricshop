"use client";

import { Minus, Plus, ScanLine, Sparkles, Type, Wand2 } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { layerTransform } from "@/components/garment/print-layer";
import { cn } from "@/lib/cn";
import { colorFor, isDark } from "@/lib/colors";
import type { Layer } from "@/lib/design";
import { GARMENTS } from "@/lib/garments";
import { useStudio } from "@/lib/studio/store";

type Box = { x: number; y: number; w: number; h: number };
type Pt = { x: number; y: number };
type Gesture =
  | { kind: "move"; id: string; start: Pt; orig: Pt; moved: boolean }
  | { kind: "scale"; id: string; center: Pt; startDist: number; origSize: number; moved: boolean }
  | { kind: "rotate"; id: string; center: Pt; moved: boolean };

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export function StudioCanvas({ svgRef, onAddText, onOpenAI }: { svgRef: RefObject<SVGSVGElement | null>; onAddText: () => void; onOpenAI: () => void }) {
  const garment = useStudio((s) => s.garment);
  const color = useStudio((s) => s.color);
  const view = useStudio((s) => s.view);
  const design = useStudio((s) => s.design);
  const selectedId = useStudio((s) => s.selectedId);
  const showGuides = useStudio((s) => s.showGuides);
  const { select, updateLayer, checkpoint, setEditingText, setView, setColor, toggleGuides } = useStudio.getState();

  const layers = design[view];
  const g = GARMENTS[garment];
  const shape = g.views[view] ?? g.views.front!;
  const pa = shape.printArea;
  const hex = colorFor(color).hex;
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [unit, setUnit] = useState(1);
  const [snapGuides, setSnapGuides] = useState({ v: false, h: false });
  const [zoom, setZoom] = useState(1);
  const gesture = useRef<Gesture | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const next: Record<string, Box> = {};
    for (const l of useStudio.getState().design[useStudio.getState().view]) {
      const el = svg.querySelector(`[data-print-layers] [data-layer="${l.id}"]`) as SVGGraphicsElement | null;
      if (!el) continue;
      try {
        const b = el.getBBox();
        next[l.id] = { x: b.x, y: b.y, w: b.width, h: b.height };
      } catch {
        /* not rendered yet */
      }
    }
    setBoxes(next);
    const ctm = svg.getScreenCTM();
    if (ctm) setUnit(1 / ctm.a);
  }, [svgRef]);

  useLayoutEffect(() => {
    measure();
  }, [layers, garment, view, zoom, measure]);

  useEffect(() => {
    const onFonts = () => measure();
    document.fonts?.addEventListener?.("loadingdone", onFonts);
    const ro = new ResizeObserver(() => measure());
    if (wrapRef.current) ro.observe(wrapRef.current);
    const t = setTimeout(measure, 400);
    return () => {
      document.fonts?.removeEventListener?.("loadingdone", onFonts);
      ro.disconnect();
      clearTimeout(t);
    };
  }, [measure]);

  const toPrint = (e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current!;
    const ctm = svg.getScreenCTM()!;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x - pa.x, y: p.y - pa.y };
  };

  const startMove = (e: RPointerEvent, layer: Layer) => {
    e.stopPropagation();
    select(layer.id);
    if (layer.locked) return;
    svgRef.current?.setPointerCapture(e.pointerId);
    gesture.current = { kind: "move", id: layer.id, start: toPrint(e), orig: { x: layer.x, y: layer.y }, moved: false };
  };

  const startScale = (e: RPointerEvent, layer: Layer) => {
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    const center = { x: layer.x * pa.w, y: layer.y * pa.h };
    const p = toPrint(e);
    gesture.current = {
      kind: "scale",
      id: layer.id,
      center,
      startDist: Math.max(4, Math.hypot(p.x - center.x, p.y - center.y)),
      origSize: layer.size,
      moved: false,
    };
  };

  const startRotate = (e: RPointerEvent, layer: Layer) => {
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    gesture.current = { kind: "rotate", id: layer.id, center: { x: layer.x * pa.w, y: layer.y * pa.h }, moved: false };
  };

  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    const gs = gesture.current;
    if (!gs) return;
    const p = toPrint(e);
    if (!gs.moved) {
      checkpoint();
      gs.moved = true;
    }
    if (gs.kind === "move") {
      let cx = gs.orig.x * pa.w + (p.x - gs.start.x);
      let cy = gs.orig.y * pa.h + (p.y - gs.start.y);
      const tol = 8 * unit;
      const v = Math.abs(cx - pa.w / 2) < tol;
      const h = Math.abs(cy - pa.h / 2) < tol;
      if (v) cx = pa.w / 2;
      if (h) cy = pa.h / 2;
      setSnapGuides({ v, h });
      updateLayer(gs.id, { x: clamp(cx / pa.w, -0.2, 1.2), y: clamp(cy / pa.h, -0.2, 1.2) });
    } else if (gs.kind === "scale") {
      const d = Math.hypot(p.x - gs.center.x, p.y - gs.center.y);
      updateLayer(gs.id, { size: clamp((gs.origSize * d) / gs.startDist, 0.015, 2.4) });
    } else {
      let deg = (Math.atan2(p.y - gs.center.y, p.x - gs.center.x) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      const snapTo = Math.round(deg / 45) * 45;
      if (e.shiftKey) deg = Math.round(deg / 15) * 15;
      else if (Math.abs(deg - snapTo) < 4) deg = snapTo;
      updateLayer(gs.id, { rotation: Math.round(deg * 10) / 10 });
    }
  };

  const endGesture = (e: RPointerEvent<SVGSVGElement>) => {
    if (gesture.current) {
      try {
        svgRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    gesture.current = null;
    setSnapGuides({ v: false, h: false });
  };

  const selected = layers.find((l) => l.id === selectedId) ?? null;
  const box = selected ? boxes[selected.id] : null;
  const accent = "#FF4A1C";
  const pad = 6 * unit;
  const hasBack = !!g.views.back;
  const guideStroke = isDark(hex) ? "rgba(243,238,229,.55)" : "rgba(15,14,13,.4)";

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        ref={wrapRef}
        className="relative min-h-0 flex-1 overflow-auto bg-[#e7e0d3] [background-image:radial-gradient(rgba(15,14,13,.09)_1px,transparent_1px)] [background-size:22px_22px]"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) select(null);
        }}
      >
        <div className="flex min-h-full items-center justify-center p-4 md:p-8" style={{ width: `${zoom * 100}%`, minWidth: "100%" }}>
          <div className="aspect-square w-full max-w-[min(100%,calc(100vh-190px))]" style={{ maxWidth: zoom > 1 ? "none" : undefined }}>
            <GarmentMockup
              garment={garment}
              color={hex}
              view={view}
              layers={layers}
              showPrintArea={showGuides}
              className="h-full w-full touch-none select-none"
              svgProps={{
                ref: svgRef,
                onPointerMove: onMove,
                onPointerUp: endGesture,
                onPointerCancel: endGesture,
                onPointerDown: (e) => {
                  const t = e.target as Element;
                  if (!t.closest("[data-hit]")) select(null);
                },
              }}
              overlay={(area) => (
                <>
                  {layers.map((l) =>
                    l.hidden || !boxes[l.id] ? null : (
                      <rect
                        key={l.id}
                        data-hit=""
                        transform={layerTransform(l, area.w, area.h)}
                        x={boxes[l.id].x}
                        y={boxes[l.id].y}
                        width={Math.max(boxes[l.id].w, 12 * unit)}
                        height={Math.max(boxes[l.id].h, 12 * unit)}
                        fill="transparent"
                        style={{ cursor: l.locked ? "pointer" : "move" }}
                        onPointerDown={(e) => startMove(e, l)}
                        onDoubleClick={() => l.type === "text" && setEditingText(true)}
                      />
                    ),
                  )}

                  {snapGuides.v && <line x1={area.w / 2} x2={area.w / 2} y1={-40} y2={area.h + 40} stroke={accent} strokeWidth={unit} strokeDasharray={`${4 * unit} ${3 * unit}`} />}
                  {snapGuides.h && <line y1={area.h / 2} y2={area.h / 2} x1={-40} x2={area.w + 40} stroke={accent} strokeWidth={unit} strokeDasharray={`${4 * unit} ${3 * unit}`} />}

                  {selected && box && !selected.hidden && (
                    <g transform={layerTransform(selected, area.w, area.h)}>
                      <rect
                        x={box.x - pad}
                        y={box.y - pad}
                        width={box.w + pad * 2}
                        height={box.h + pad * 2}
                        fill="none"
                        stroke={accent}
                        strokeWidth={1.5 * unit}
                        strokeDasharray={selected.locked ? `${4 * unit} ${3 * unit}` : undefined}
                        pointerEvents="none"
                      />
                      {!selected.locked && (
                        <>
                          <line
                            x1={box.x + box.w / 2}
                            x2={box.x + box.w / 2}
                            y1={box.y - pad}
                            y2={box.y - pad - 26 * unit}
                            stroke={accent}
                            strokeWidth={1.5 * unit}
                            pointerEvents="none"
                          />
                          <circle
                            data-hit=""
                            cx={box.x + box.w / 2}
                            cy={box.y - pad - 26 * unit}
                            r={8 * unit}
                            fill={accent}
                            stroke="#fff"
                            strokeWidth={2 * unit}
                            style={{ cursor: "grab" }}
                            onPointerDown={(e) => startRotate(e, selected)}
                          />
                          {[
                            [box.x - pad, box.y - pad, "nwse-resize"],
                            [box.x + box.w + pad, box.y - pad, "nesw-resize"],
                            [box.x - pad, box.y + box.h + pad, "nesw-resize"],
                            [box.x + box.w + pad, box.y + box.h + pad, "nwse-resize"],
                          ].map(([x, y, cursor], i) => (
                            <rect
                              key={i}
                              data-hit=""
                              x={(x as number) - 6 * unit}
                              y={(y as number) - 6 * unit}
                              width={12 * unit}
                              height={12 * unit}
                              rx={3 * unit}
                              fill="#fff"
                              stroke={accent}
                              strokeWidth={2 * unit}
                              style={{ cursor: cursor as string }}
                              onPointerDown={(e) => startScale(e, selected)}
                            />
                          ))}
                        </>
                      )}
                    </g>
                  )}

                  {showGuides && (
                    <text x={0} y={-10 * unit} fontSize={11 * unit} fill={guideStroke} style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.08em" }}>
                      PRINT AREA
                    </text>
                  )}
                </>
              )}
            />
          </div>
        </div>

        {layers.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-24 md:items-center md:pb-0">
            <div className="pointer-events-auto rounded-3xl bg-bone/90 p-5 text-center shadow-2xl backdrop-blur md:translate-y-28">
              <p className="display text-2xl">Start with a line.</p>
              <p className="mt-1 text-sm text-smoke">The {view} is blank. Add words, a graphic or generate something new.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={onAddText} className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm text-bone">
                  <Type className="size-4" /> Add text
                </button>
                <button type="button" onClick={onOpenAI} className="flex h-10 items-center gap-2 rounded-full bg-red px-4 text-sm font-medium text-ink">
                  <Wand2 className="size-4" /> Generate with AI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* bottom bar */}
      <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 bg-bone px-3 py-2.5 md:px-4">
        {hasBack && (
          <div className="flex rounded-full bg-paper p-1 text-sm" role="tablist" aria-label="Side">
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn("h-8 rounded-full px-4 capitalize transition", view === v ? "bg-ink text-bone" : "hover:bg-sand")}
              >
                {v}
                {design[v].length > 0 && <span className={cn("ml-1.5 inline-block size-1.5 rounded-full align-middle", view === v ? "bg-red" : "bg-ink/40")} />}
              </button>
            ))}
          </div>
        )}
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1 max-md:order-last max-md:basis-full">
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
                  "size-7 shrink-0 rounded-full border border-ink/15 ring-offset-2 ring-offset-bone transition",
                  color === id ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-ink/25",
                )}
                style={{ background: c.hex }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleGuides}
            className={cn("grid size-9 place-items-center rounded-full transition", showGuides ? "bg-ink text-bone" : "hover:bg-paper")}
            title="Print area guides"
            aria-pressed={showGuides}
            aria-label="Toggle print area guides"
          >
            <ScanLine className="size-4" />
          </button>
          <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="grid size-9 place-items-center rounded-full hover:bg-paper" aria-label="Zoom out">
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center font-mono text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(2.5, z + 0.5))} className="grid size-9 place-items-center rounded-full hover:bg-paper" aria-label="Zoom in">
            <Plus className="size-4" />
          </button>
        </div>
        <span className="hidden items-center gap-1.5 font-mono text-[11px] text-smoke xl:flex">
          <Sparkles className="size-3 text-red" /> Drag to move · corners to scale · dot to rotate · double-click to edit
        </span>
      </div>
    </div>
  );
}

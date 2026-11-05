// The print design model shared by catalog products and the Studio.
// Positions are normalised to the print area: x/y are the layer centre (0–1),
// sizes are fractions of the print-area width, so designs survive switching garments.

import { isDark } from "./colors";
import { fontFor } from "./fonts";
import type { GarmentView } from "./garments";

type LayerBase = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  flipX?: boolean;
  locked?: boolean;
  hidden?: boolean;
};

export type TextLayer = LayerBase & {
  type: "text";
  text: string;
  font: string;
  /** Font size as a fraction of print-area width. */
  size: number;
  color: string;
  /** Tracking in em. */
  letterSpacing: number;
  lineHeight: number;
  align: "left" | "center" | "right";
  /** -100 (smile) … 0 (straight) … 100 (arch). */
  curve: number;
  uppercase?: boolean;
  strokeColor?: string;
  /** Outline width in em. */
  strokeWidth?: number;
};

export type GraphicLayer = LayerBase & {
  type: "graphic";
  graphic: string;
  color: string;
  /** Width as a fraction of print-area width. */
  size: number;
};

export type ImageLayer = LayerBase & {
  type: "image";
  src: string;
  size: number;
  /** height / width of the bitmap */
  aspect: number;
  name?: string;
};

export type Layer = TextLayer | GraphicLayer | ImageLayer;

export type Design = Record<GarmentView, Layer[]>;

export const emptyDesign = (): Design => ({ front: [], back: [] });

let counter = 0;
export function layerId(prefix = "l"): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function text(t: Partial<TextLayer> & { text: string }): TextLayer {
  return {
    id: t.id ?? layerId("t"),
    type: "text",
    x: 0.5,
    y: 0.3,
    rotation: 0,
    opacity: 1,
    font: "anton",
    size: 0.16,
    color: "#F3EEE5",
    letterSpacing: 0,
    lineHeight: 1,
    align: "center",
    curve: 0,
    ...t,
  };
}

export function graphic(gr: Partial<GraphicLayer> & { graphic: string }): GraphicLayer {
  return {
    id: gr.id ?? layerId("g"),
    type: "graphic",
    x: 0.5,
    y: 0.5,
    rotation: 0,
    opacity: 1,
    color: "#F3EEE5",
    size: 0.3,
    ...gr,
  };
}

export function displayText(layer: TextLayer): string {
  return layer.uppercase ? layer.text.toUpperCase() : layer.text;
}

/** Deterministic width estimate (used for curved text radius; identical on server and client). */
export function estimateLineWidth(line: string, layer: TextLayer, printWidth: number): number {
  const font = fontFor(layer.font);
  const fs = layer.size * printWidth;
  return line.length * fs * (font.widthFactor + layer.letterSpacing);
}

/** Radius for curved text, or null for straight text. */
export function curveRadius(layer: TextLayer, printWidth: number): number | null {
  if (!layer.curve) return null;
  const line = displayText(layer).replace(/\n/g, " ");
  const width = Math.max(estimateLineWidth(line, layer, printWidth), layer.size * printWidth);
  const angle = (Math.abs(layer.curve) / 100) * Math.PI * 1.4; // up to ~250° of arc
  return Math.max(width / angle, layer.size * printWidth * 0.6);
}

export function layerLabel(layer: Layer): string {
  if (layer.type === "text") return layer.text.split("\n")[0].slice(0, 28) || "Text";
  if (layer.type === "graphic") return layer.graphic[0].toUpperCase() + layer.graphic.slice(1);
  return layer.name ?? "Image";
}

export function hasPrint(design: Design | undefined, view: GarmentView): boolean {
  return !!design?.[view]?.some((l) => !l.hidden);
}

/** Catalog designs use "auto" ink: bone on dark cloth, ink-black on light cloth. */
export function resolveInk(color: string, garmentHex: string): string {
  if (color !== "auto") return color;
  return isDark(garmentHex) ? "#F3EEE5" : "#161515";
}

export function resolveLayers(layers: Layer[], garmentHex: string): Layer[] {
  return layers.map((l) => {
    if (l.type === "image") return l;
    const next = { ...l, color: resolveInk(l.color, garmentHex) };
    if (next.type === "text" && next.strokeColor) next.strokeColor = resolveInk(next.strokeColor, garmentHex);
    return next;
  });
}

export function resolveDesign(design: Design, garmentHex: string): Design {
  return { front: resolveLayers(design.front, garmentHex), back: resolveLayers(design.back, garmentHex) };
}

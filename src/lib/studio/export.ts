"use client";

// Rasterises the Studio canvas. SVG drawn into a <canvas> can't reach page fonts or
// external files, so fonts and images are inlined as data URIs first.

import type { Design } from "../design";
import { fontFor } from "../fonts";
import { loadImage, toDataURL } from "./image-tools";

const fontCache = new Map<string, string>();

async function fontFaceCSS(design: Design): Promise<string> {
  const ids = new Set<string>();
  for (const layer of [...design.front, ...design.back]) if (layer.type === "text") ids.add(layer.font);
  const rules = await Promise.all(
    [...ids].map(async (id) => {
      const font = fontFor(id);
      let data = fontCache.get(id);
      if (!data) {
        data = await toDataURL(font.file);
        fontCache.set(id, data);
      }
      return `@font-face{font-family:"${font.family}";src:url(${data}) format("woff2");font-weight:${font.weight};font-style:${font.style};}`;
    }),
  );
  return rules.join("");
}

async function inlineImages(root: Element) {
  const images = Array.from(root.querySelectorAll("image"));
  await Promise.all(
    images.map(async (img) => {
      const href = img.getAttribute("href") ?? img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (href && !href.startsWith("data:")) img.setAttribute("href", await toDataURL(href));
    }),
  );
}

async function rasterise(svg: SVGSVGElement, width: number, height: number, background?: string): Promise<Blob> {
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await loadImage(url);
    // give the embedded fonts a beat to decode before drawing
    await new Promise((r) => setTimeout(r, 80));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function viewBoxOf(svg: SVGSVGElement) {
  const [x, y, w, h] = (svg.getAttribute("viewBox") ?? "0 0 1000 1000").split(/[\s,]+/).map(Number);
  return { x, y, w, h };
}

/** Full garment mockup as PNG (Studio overlay excluded). */
export async function exportMockup(
  source: SVGSVGElement,
  design: Design,
  { size = 2000, background = "#EAE3D7" }: { size?: number; background?: string } = {},
): Promise<Blob> {
  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("[data-export-ignore]").forEach((n) => n.remove());
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = await fontFaceCSS(design);
  clone.insertBefore(style, clone.firstChild);
  await inlineImages(clone);
  const vb = viewBoxOf(source);
  return rasterise(clone, size, Math.round((size * vb.h) / vb.w), background);
}

/** Print-ready artwork: only the design, transparent background, at print resolution. */
export async function exportPrintFile(
  source: SVGSVGElement,
  design: Design,
  area: { w: number; h: number },
  { width = 3600 }: { width?: number } = {},
): Promise<Blob> {
  const layers = source.querySelector("[data-print-layers]");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${area.w} ${area.h}`);
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = await fontFaceCSS(design);
  svg.appendChild(style);
  if (layers) {
    const g = layers.cloneNode(true) as SVGGElement;
    g.removeAttribute("transform");
    svg.appendChild(g);
  }
  await inlineImages(svg);
  return rasterise(svg, width, Math.round((width * area.h) / area.w));
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "design";

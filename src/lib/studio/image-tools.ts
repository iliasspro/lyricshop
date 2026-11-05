"use client";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = src;
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Downscale to fit `max` px and return a PNG data URL plus aspect (h/w). */
export async function normaliseImage(src: string, max = 1600): Promise<{ src: string; aspect: number }> {
  const img = await loadImage(src);
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  if (scale === 1 && src.startsWith("data:image/png")) return { src, aspect: h / w };
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return { src: canvas.toDataURL("image/png"), aspect: h / w };
}

/**
 * Removes a flat background by flood-filling from the image edges.
 * Pixels connected to the border and close to the sampled background color become
 * transparent; a soft band around the cut is feathered so edges don't look jagged.
 * Interior areas of the same color (e.g. white inside a letter) are kept.
 */
export async function removeBackground(src: string, tolerance = 42): Promise<string> {
  const img = await loadImage(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;

  // Background = median-ish of border samples.
  const samples: number[][] = [];
  const step = Math.max(1, Math.floor((w + h) / 200));
  for (let x = 0; x < w; x += step) samples.push(px(d, w, x, 0), px(d, w, x, h - 1));
  for (let y = 0; y < h; y += step) samples.push(px(d, w, 0, y), px(d, w, w - 1, y));
  const bg = [0, 1, 2].map((c) => {
    const vals = samples.map((s) => s[c]).sort((a, b) => a - b);
    return vals[Math.floor(vals.length / 2)];
  });

  const dist = (i: number) => {
    const dr = d[i] - bg[0];
    const dg = d[i + 1] - bg[1];
    const db = d[i + 2] - bg[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const removed = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  const push = (x: number, y: number) => {
    const p = y * w + x;
    if (removed[p]) return;
    if (d[p * 4 + 3] < 10 || dist(p * 4) <= tolerance) {
      removed[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }

  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    if (removed[p]) {
      d[i + 3] = 0;
      continue;
    }
    // feather pixels that touch the removed region
    const x = p % w;
    const y = (p - x) / w;
    const touches =
      (x > 0 && removed[p - 1]) || (x < w - 1 && removed[p + 1]) || (y > 0 && removed[p - w]) || (y < h - 1 && removed[p + w]);
    if (touches) {
      const t = Math.min(1, Math.max(0, (dist(i) - tolerance) / (tolerance * 1.5)));
      d[i + 3] = Math.round(d[i + 3] * (0.35 + 0.65 * t));
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function px(d: Uint8ClampedArray, w: number, x: number, y: number) {
  const i = (y * w + x) * 4;
  return [d[i], d[i + 1], d[i + 2]];
}

/** Converts any same-origin or data URL to a data URL (for self-contained exports). */
export async function toDataURL(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

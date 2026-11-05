import { fontFor } from "./fonts";

/**
 * Breaks a lyric into 1–4 balanced lines and picks the largest font size that fits
 * a print area of the given aspect (h / w). Size is returned as a fraction of width.
 */
export function fitLyric(
  raw: string,
  fontId: string,
  { aspect = 1, lineHeight = 0.95, maxSize = 0.34, uppercase = false }: { aspect?: number; lineHeight?: number; maxSize?: number; uppercase?: boolean } = {},
): { text: string; size: number } {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (!clean) return { text: "", size: 0.16 };
  const font = fontFor(fontId);
  const wf = font.widthFactor * (uppercase ? 1.12 : 1);
  const words = clean.split(" ");
  let best = { text: clean, size: 0 };

  for (let n = 1; n <= Math.min(4, words.length); n++) {
    const lines = balance(words, n);
    const longest = Math.max(...lines.map((l) => l.length));
    const byWidth = 0.92 / (longest * wf);
    const byHeight = (0.82 * aspect) / (n * lineHeight);
    const size = Math.min(byWidth, byHeight, maxSize);
    // a small bias towards fewer lines keeps short phrases on one line
    if (size > best.size * 1.08 || best.size === 0) best = { text: lines.join("\n"), size };
  }
  return { text: best.text, size: Math.max(0.045, best.size) };
}

function balance(words: string[], n: number): string[] {
  const total = words.join(" ").length;
  const target = total / n;
  const lines: string[] = [];
  let current: string[] = [];
  for (const w of words) {
    const candidate = [...current, w].join(" ");
    if (current.length && candidate.length > target * 1.15 && lines.length < n - 1) {
      lines.push(current.join(" "));
      current = [w];
    } else current.push(w);
  }
  if (current.length) lines.push(current.join(" "));
  return lines;
}

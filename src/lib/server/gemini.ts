// Minimal client for Nano Banana Pro (Gemini 3 Pro Image) over the Gemini REST API.
// Server-only: reads GEMINI_API_KEY and never exposes it to the browser.

const API = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3-pro-image";
const FALLBACK_MODELS = ["gemini-3-pro-image-preview"];

export class NotConfiguredError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not set");
  }
}

type InlineData = { mimeType?: string; mime_type?: string; data: string };
type Part = { text?: string; thought?: boolean; inlineData?: InlineData; inline_data?: InlineData };

export type ImageInput = { mimeType: string; data: string };

export function isConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

export async function generateImage({
  prompt,
  images = [],
  aspectRatio = "1:1",
  imageSize = "1K",
}: {
  prompt: string;
  images?: ImageInput[];
  aspectRatio?: string;
  imageSize?: "1K" | "2K" | "4K";
}): Promise<{ dataUrl: string; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new NotConfiguredError();

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } }))],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio, imageSize },
    },
  };

  const preferred = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
  const models = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];

  for (const model of models) {
    const res = await fetch(`${API}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(150_000),
    });
    // Model ids move between preview and GA; try the next one if this id isn't served.
    if (res.status === 404) continue;
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message: string = json?.error?.message ?? `Gemini returned ${res.status}`;
      if (res.status === 429) throw new Error("Nano Banana Pro is rate-limited right now. Try again in a minute.");
      if (res.status === 400 && /api key/i.test(message)) throw new Error("The Gemini API key was rejected. Check GEMINI_API_KEY.");
      throw new Error(message);
    }
    const candidate = json?.candidates?.[0];
    const parts: Part[] = candidate?.content?.parts ?? [];
    // Gemini 3 image models may stream interim "thought" images; the final image is the last non-thought one.
    const images = parts.filter((p) => (p.inlineData || p.inline_data) && !p.thought);
    const last = images[images.length - 1];
    if (!last) {
      const reason: string | undefined = candidate?.finishReason ?? json?.promptFeedback?.blockReason;
      if (reason && /SAFETY|BLOCK|PROHIBITED/i.test(reason)) {
        throw new Error("That request was blocked by the safety filter. Try describing it differently.");
      }
      const note = parts.find((p) => p.text && !p.thought)?.text;
      throw new Error(note ? `No image came back: ${note.slice(0, 160)}` : "No image came back. Try again.");
    }
    const inline = (last.inlineData ?? last.inline_data)!;
    const mime = inline.mimeType ?? inline.mime_type ?? "image/png";
    return { dataUrl: `data:${mime};base64,${inline.data}`, model };
  }
  throw new Error("No Nano Banana Pro model is available for this API key.");
}

/** Splits a data URL into the parts Gemini expects. */
export function parseDataUrl(url: string): ImageInput | null {
  const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(url);
  return m ? { mimeType: m[1], data: m[2] } : null;
}

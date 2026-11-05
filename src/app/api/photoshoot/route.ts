import { generateImage, NotConfiguredError, parseDataUrl } from "@/lib/server/gemini";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";

export const maxDuration = 150;

const SCENES: Record<string, string> = {
  rooftop: "on a city rooftop at blue hour with soft city-light bokeh and warm rim light",
  "record-store": "browsing crates of vinyl in an independent record store under warm tungsten light",
  studio: "a clean studio portrait against a seamless warm bone-colored backdrop with soft window light",
  street: "on a rain-soaked city street at night under a glowing red neon sign, wet reflections",
};

const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const limit = rateLimit(`photoshoot:${clientKey(request)}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { error: "rate_limited", message: `The photographer needs a breather. Try again in ${Math.ceil(limit.retryAfter / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: { image?: unknown; garment?: unknown; color?: unknown; scene?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request", message: "Send JSON with a mockup image." }, { status: 400 });
  }
  const image = typeof body.image === "string" ? parseDataUrl(body.image) : null;
  if (!image) return Response.json({ error: "bad_request", message: "The mockup must be a PNG, JPEG or WebP data URL." }, { status: 400 });
  if ((image.data.length * 3) / 4 > MAX_BYTES) return Response.json({ error: "bad_request", message: "The mockup is too large." }, { status: 413 });

  const garment = typeof body.garment === "string" ? body.garment.slice(0, 60) : "heavyweight hoodie";
  const color = typeof body.color === "string" ? body.color.slice(0, 40) : "";
  const scene = SCENES[typeof body.scene === "string" ? body.scene : ""] ?? SCENES.rooftop;

  const prompt = [
    `Create a photorealistic editorial streetwear photograph of a person wearing the exact ${garment}${color ? ` in ${color}` : ""} shown in the reference image.`,
    "Reproduce the printed design from the reference faithfully: identical artwork, identical lettering and spelling, identical ink colors, same placement and scale on the garment.",
    `Scene: ${scene}.`,
    "Shot on 35mm film with natural grain and shallow depth of field, candid and confident, fashion-magazine quality.",
    "Frame from the knees up so the print is clearly visible and undistorted. No other logos, no watermark.",
  ].join(" ");

  try {
    const { dataUrl, model } = await generateImage({ prompt, images: [image], aspectRatio: "3:4", imageSize: "1K" });
    return Response.json({ image: dataUrl, model });
  } catch (e) {
    if (e instanceof NotConfiguredError) {
      return Response.json(
        { error: "not_configured", message: "The photoshoot needs a Gemini API key to call Nano Banana Pro. Add GEMINI_API_KEY to .env.local." },
        { status: 501 },
      );
    }
    return Response.json({ error: "generation_failed", message: e instanceof Error ? e.message : "Photoshoot failed" }, { status: 502 });
  }
}

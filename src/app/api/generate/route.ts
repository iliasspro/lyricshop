import { generateImage, NotConfiguredError } from "@/lib/server/gemini";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";

export const maxDuration = 150;

const STYLES: Record<string, string> = {
  screenprint: "bold two-color screen print, thick confident linework, flat spot colors, no gradients",
  tattoo: "American traditional tattoo flash, heavy black outlines, limited palette of red, cream and black",
  lineart: "single-weight continuous line drawing in black ink, minimal and elegant",
  halftone: "retro halftone poster illustration, coarse dot shading, high contrast, two colors",
  woodcut: "linocut / woodcut print, carved gouge texture, solid black ink",
  riso: "risograph print with grainy texture and two overlapping spot inks, fluorescent pink and blue",
  chrome: "Y2K liquid chrome emblem, glossy reflective metal, sharp highlights",
  sticker: "die-cut vinyl sticker, playful cartoon style, thick clean outline",
};

export async function POST(request: Request) {
  const limit = rateLimit(`generate:${clientKey(request)}`, 20, 60 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { error: "rate_limited", message: `Easy, maestro — try again in ${Math.ceil(limit.retryAfter / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: { prompt?: unknown; style?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request", message: "Send JSON with a prompt." }, { status: 400 });
  }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (prompt.length < 3 || prompt.length > 400) {
    return Response.json({ error: "bad_request", message: "Describe the graphic in 3–400 characters." }, { status: 400 });
  }
  const style = STYLES[typeof body.style === "string" ? body.style : ""] ?? STYLES.screenprint;

  const full = [
    "Create one standalone graphic for screen printing on clothing.",
    `Subject: ${prompt}.`,
    `Art style: ${style}.`,
    "Composition: a single centered motif with generous empty margins, isolated on a perfectly flat pure white (#FFFFFF) background.",
    "No garment, no mockup, no frame, no drop shadow, no background scenery, no watermark, no signature.",
    "Bold readable shapes, limited color palette, crisp edges, print-ready artwork.",
    "Only include lettering if the subject explicitly asks for words, and spell them exactly.",
  ].join(" ");

  try {
    const { dataUrl, model } = await generateImage({ prompt: full, aspectRatio: "1:1", imageSize: "1K" });
    return Response.json({ image: dataUrl, model });
  } catch (e) {
    if (e instanceof NotConfiguredError) {
      return Response.json(
        {
          error: "not_configured",
          message: "The Studio needs a Gemini API key to call Nano Banana Pro. Add GEMINI_API_KEY to .env.local.",
        },
        { status: 501 },
      );
    }
    return Response.json({ error: "generation_failed", message: e instanceof Error ? e.message : "Generation failed" }, { status: 502 });
  }
}

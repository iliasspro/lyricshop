import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/cn";
import type { TextLayer } from "@/lib/design";
import type { Product } from "@/lib/data/products";
import { fontFor } from "@/lib/fonts";

/** The first printed line of each piece, set in the typeface it's printed in. */
export function linesFromProducts(products: Product[]) {
  const seen = new Set<string>();
  const lines: { text: string; family: string; weight: number; style: "normal" | "italic"; upper: boolean }[] = [];
  for (const p of products) {
    const layer = [...p.design.front, ...p.design.back].find((l): l is TextLayer => l.type === "text");
    if (!layer) continue;
    const text = layer.text.replace(/\s*\n\s*/g, " ").trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    const font = fontFor(layer.font);
    lines.push({ text, family: font.family, weight: font.weight, style: font.style, upper: !!layer.uppercase });
  }
  return lines;
}

export function LinesMarquee({
  products,
  label,
  tone = "ink",
}: {
  products: Product[];
  label: string;
  tone?: "ink" | "paper";
}) {
  const lines = linesFromProducts(products);
  if (lines.length === 0) return null;
  return (
    <section
      className={cn("overflow-hidden py-8 md:py-10", tone === "ink" ? "bg-ink text-bone" : "bg-paper text-ink")}
      aria-label={label}
    >
      <Marquee duration={Math.max(28, lines.length * 9)}>
        {lines.map((l) => (
          <span
            key={l.text}
            className="flex items-center gap-10 whitespace-nowrap px-5 text-[clamp(2.4rem,6vw,5.5rem)] leading-none"
            style={{
              fontFamily: `"${l.family}"`,
              fontWeight: l.weight,
              fontStyle: l.style,
              textTransform: l.upper ? "uppercase" : undefined,
            }}
          >
            {l.text}
            <span className="size-3 shrink-0 rounded-full bg-red" aria-hidden />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

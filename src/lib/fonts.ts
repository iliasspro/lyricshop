// Design fonts used on garments (catalog prints + the Studio).
// Files are self-hosted in /public/fonts/design (see scripts/fetch-fonts.mjs) so that
// exports can embed the exact font bytes.

export type FontCategory =
  | "Condensed"
  | "Grotesk"
  | "Block"
  | "Serif"
  | "Retro"
  | "Handwritten"
  | "Script"
  | "Gothic"
  | "Typewriter";

export type DesignFont = {
  id: string;
  label: string;
  family: string; // CSS font-family name declared in design-fonts.css
  category: FontCategory;
  weight: number;
  style: "normal" | "italic";
  file: string;
  /** Rough ratio of average glyph width to font size, used for layout estimates. */
  widthFactor: number;
};

const f = (
  id: string,
  label: string,
  category: FontCategory,
  widthFactor: number,
  weight = 400,
  style: "normal" | "italic" = "normal",
): DesignFont => ({
  id,
  label,
  family: `ls-${id}`,
  category,
  weight,
  style,
  file: `/fonts/design/${id}.woff2`,
  widthFactor,
});

export const DESIGN_FONTS: DesignFont[] = [
  f("anton", "Anton", "Condensed", 0.42),
  f("bebas-neue", "Bebas Neue", "Condensed", 0.4),
  f("archivo-black", "Archivo Black", "Grotesk", 0.66),
  f("bricolage", "Bricolage", "Grotesk", 0.56, 800),
  f("bungee", "Bungee", "Block", 0.72),
  f("instrument-serif", "Instrument Serif", "Serif", 0.42),
  f("instrument-serif-italic", "Instrument Italic", "Serif", 0.4, 400, "italic"),
  f("playfair-black-italic", "Playfair Black", "Serif", 0.55, 900, "italic"),
  f("abril-fatface", "Abril Fatface", "Serif", 0.55),
  f("dm-serif-display", "DM Serif", "Serif", 0.5),
  f("shrikhand", "Shrikhand", "Retro", 0.66),
  f("monoton", "Monoton", "Retro", 0.95),
  f("rubik-glitch", "Rubik Glitch", "Retro", 0.62),
  f("permanent-marker", "Permanent Marker", "Handwritten", 0.58),
  f("caveat", "Caveat", "Handwritten", 0.4, 700),
  f("rock-salt", "Rock Salt", "Handwritten", 0.9),
  f("yellowtail", "Yellowtail", "Script", 0.45),
  f("pacifico", "Pacifico", "Script", 0.6),
  f("unifraktur", "Unifraktur", "Gothic", 0.5),
  f("pirata-one", "Pirata One", "Gothic", 0.42),
  f("special-elite", "Special Elite", "Typewriter", 0.6),
  f("space-mono", "Space Mono", "Typewriter", 0.62, 700),
];

export const FONT_BY_ID: Record<string, DesignFont> = Object.fromEntries(
  DESIGN_FONTS.map((font) => [font.id, font]),
);

export function fontFor(id: string): DesignFont {
  return FONT_BY_ID[id] ?? DESIGN_FONTS[0];
}

export const FONT_CATEGORIES: FontCategory[] = [
  "Condensed",
  "Grotesk",
  "Block",
  "Serif",
  "Retro",
  "Handwritten",
  "Script",
  "Gothic",
  "Typewriter",
];

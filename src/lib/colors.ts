export type GarmentColor = {
  id: string;
  name: string;
  hex: string;
};

export const GARMENT_COLORS: GarmentColor[] = [
  { id: "black", name: "Ink Black", hex: "#161515" },
  { id: "bone", name: "Bone", hex: "#EFE8DB" },
  { id: "white", name: "Optic White", hex: "#F8F7F3" },
  { id: "red", name: "On-Air Red", hex: "#D23A1E" },
  { id: "charcoal", name: "Faded Charcoal", hex: "#45444A" },
  { id: "heather", name: "Heather Grey", hex: "#B9B7B2" },
  { id: "sand", name: "Sand", hex: "#D5C4A7" },
  { id: "sage", name: "Sage", hex: "#A3AE95" },
  { id: "forest", name: "Forest", hex: "#2E4636" },
  { id: "olive", name: "Olive", hex: "#5F5B3B" },
  { id: "navy", name: "Midnight Navy", hex: "#1D2639" },
  { id: "burgundy", name: "Burgundy", hex: "#5A1D29" },
  { id: "lilac", name: "Lilac", hex: "#C6B6D6" },
  { id: "natural", name: "Natural Canvas", hex: "#E6D9BF" },
];

export const COLOR_BY_ID: Record<string, GarmentColor> = Object.fromEntries(
  GARMENT_COLORS.map((c) => [c.id, c]),
);

export function colorFor(id: string): GarmentColor {
  return COLOR_BY_ID[id] ?? GARMENT_COLORS[0];
}

/** Relative luminance (0–1) of a hex color. */
export function luminance(hex: string): number {
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(n.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.22;
}

/** Ink colors offered for prints, text and graphics. */
export const INK_SWATCHES = [
  "#F3EEE5",
  "#FFFFFF",
  "#0F0E0D",
  "#FF4A1C",
  "#D23A1E",
  "#F5D547",
  "#FF9EC4",
  "#7FD1AE",
  "#6CA6FF",
  "#B9A7FF",
  "#C9A227",
  "#8C857B",
];

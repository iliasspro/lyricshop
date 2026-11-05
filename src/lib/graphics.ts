// One-color vector graphics for prints. Every graphic lives in a 100×100 box and
// prints in a single ink, so cut-outs are made with the even-odd fill rule.

export type GraphicCategory = "Music" | "Symbols" | "Shapes";

export type Graphic = {
  id: string;
  name: string;
  category: GraphicCategory;
  d: string;
  fillRule: "evenodd" | "nonzero";
  /** Height / width of the artwork's visual bounds (all fit the 100×100 box). */
  aspect: number;
};

const r = (n: number) => Math.round(n * 100) / 100;

function circle(cx: number, cy: number, rad: number, ccw = false): string {
  const s = ccw ? 0 : 1;
  return `M${r(cx - rad)} ${cy}A${rad} ${rad} 0 1 ${s} ${r(cx + rad)} ${cy}A${rad} ${rad} 0 1 ${s} ${r(cx - rad)} ${cy}Z`;
}

function star(points: number, outer: number, inner: number, rot = -90, cx = 50, cy = 50): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner;
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    pts.push(`${r(cx + rad * Math.cos(a))} ${r(cy + rad * Math.sin(a))}`);
  }
  return `M${pts.join("L")}Z`;
}

function roundRect(x: number, y: number, w: number, h: number, rad: number): string {
  return `M${x + rad} ${y}H${x + w - rad}A${rad} ${rad} 0 0 1 ${x + w} ${y + rad}V${y + h - rad}A${rad} ${rad} 0 0 1 ${x + w - rad} ${y + h}H${x + rad}A${rad} ${rad} 0 0 1 ${x} ${y + h - rad}V${y + rad}A${rad} ${rad} 0 0 1 ${x + rad} ${y}Z`;
}

function waveform(): string {
  const heights = [18, 34, 52, 30, 70, 88, 60, 40, 76, 96, 64, 44, 26, 58, 80, 48, 30, 16];
  const w = 100 / heights.length;
  return heights
    .map((h, i) => roundRect(r(i * w + w * 0.18), r(50 - h / 2), r(w * 0.64), h, r(w * 0.32)))
    .join("");
}

function sun(): string {
  let d = circle(50, 50, 20);
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const tip = [50 + 48 * Math.cos(a), 50 + 48 * Math.sin(a)];
    const b1 = [50 + 27 * Math.cos(a - 0.13), 50 + 27 * Math.sin(a - 0.13)];
    const b2 = [50 + 27 * Math.cos(a + 0.13), 50 + 27 * Math.sin(a + 0.13)];
    d += `M${r(b1[0])} ${r(b1[1])}L${r(tip[0])} ${r(tip[1])}L${r(b2[0])} ${r(b2[1])}Z`;
  }
  return d;
}

const g = (
  id: string,
  name: string,
  category: GraphicCategory,
  d: string,
  fillRule: "evenodd" | "nonzero" = "evenodd",
  aspect = 1,
): Graphic => ({ id, name, category, d, fillRule, aspect });

export const GRAPHICS: Graphic[] = [
  // Music
  g(
    "vinyl",
    "Vinyl",
    "Music",
    [48, 41.5, 40, 34.5, 33, 17, 15, 3].map((rad) => circle(50, 50, rad)).join(""),
  ),
  g(
    "quote",
    "Quote",
    "Music",
    "M7 46C7 27 18 12 40 7L43 11.5C32 15 25 21 24 29A20 20 0 1 1 7 46Z" +
      circle(27, 49, 2.6) +
      "M56 46C56 27 67 12 89 7L92 11.5C81 15 74 21 73 29A20 20 0 1 1 56 46Z" +
      circle(76, 49, 2.6),
    "evenodd",
    0.62,
  ),
  g(
    "note",
    "Note",
    "Music",
    "M48 6H56V26C66 32 80 40 82 56C83 64 80 70 76 74C78 68 78 62 74 56C70 50 62 46 56 44V80C56 90 46 98 34 98C22 98 14 92 14 84C14 74 24 66 36 66C41 66 45 67 48 69Z",
    "nonzero",
  ),
  g(
    "notes",
    "Notes",
    "Music",
    "M30 22L88 6V72C88 82 79 90 68 90C58 90 52 84 52 78C52 70 60 64 70 64C74 64 77 65 80 66V30L38 41V82C38 92 29 100 18 100C8 100 2 94 2 88C2 80 10 74 20 74C24 74 27 75 30 76Z",
    "nonzero",
  ),
  g(
    "cassette",
    "Cassette",
    "Music",
    roundRect(4, 18, 92, 64, 8) +
      roundRect(20, 30, 60, 26, 6) +
      circle(36, 43, 9) +
      circle(36, 43, 3.5) +
      circle(64, 43, 9) +
      circle(64, 43, 3.5) +
      "M24 82L30 66H70L76 82Z" +
      circle(40, 74, 3) +
      circle(60, 74, 3),
    "evenodd",
    0.64,
  ),
  g(
    "mic",
    "Mic",
    "Music",
    roundRect(30, 4, 40, 56, 20) +
      "M18 40V46C18 64 32 76 50 76C68 76 82 64 82 46V40H75V46C75 60 64 70 50 70C36 70 25 60 25 46V40Z" +
      "M47 75H53V90H68V96H32V90H47Z",
    "nonzero",
  ),
  g(
    "headphones",
    "Headphones",
    "Music",
    "M12 62C12 34 28 12 50 12C72 12 88 34 88 62H80C80 38 68 20 50 20C32 20 20 38 20 62Z" +
      roundRect(6, 56, 22, 38, 8) +
      roundRect(72, 56, 22, 38, 8),
    "nonzero",
  ),
  g("wave", "Waveform", "Music", waveform(), "nonzero", 0.96),

  // Symbols
  g("star", "Star", "Symbols", star(5, 49, 20), "nonzero"),
  g(
    "sparkle",
    "Sparkle",
    "Symbols",
    "M50 2C53 30 70 47 98 50C70 53 53 70 50 98C47 70 30 53 2 50C30 47 47 30 50 2Z",
    "nonzero",
  ),
  g(
    "heart",
    "Heart",
    "Symbols",
    "M50 92C22 70 4 52 4 32C4 16 16 6 30 6C40 6 47 12 50 20C53 12 60 6 70 6C84 6 96 16 96 32C96 52 78 70 50 92Z",
    "nonzero",
  ),
  g("bolt", "Bolt", "Symbols", "M60 2L16 56H45L36 98L84 40H55L66 2Z", "nonzero"),
  g(
    "flame",
    "Flame",
    "Symbols",
    "M50 4C56 22 78 32 78 60C78 82 64 96 50 96C36 96 22 84 22 64C22 50 30 42 35 33C37 46 43 51 48 51C45 36 43 19 50 4Z" +
      "M50 92C58 92 64 85 64 76C64 66 56 60 53 52C50 60 46 62 44 66C42 70 36 72 36 78C36 86 43 92 50 92Z",
  ),
  g(
    "smiley",
    "Smiley",
    "Symbols",
    circle(50, 50, 46) +
      "M31 40A5 8 0 1 0 41 40A5 8 0 1 0 31 40Z" +
      "M59 40A5 8 0 1 0 69 40A5 8 0 1 0 59 40Z" +
      "M27 57C33 74 67 74 73 57C71 55 68 55 66 57C60 67 40 67 34 57C32 55 29 55 27 57Z",
  ),
  g("crown", "Crown", "Symbols", "M8 30L28 52L50 12L72 52L92 30L84 84H16Z" + circle(50, 70, 6), "evenodd", 0.78),
  g(
    "moon",
    "Moon",
    "Symbols",
    "M64 6C40 10 22 30 22 54C22 78 42 96 66 96C77 96 86 92 93 85C87 87 81 88 75 88C51 88 32 70 32 46C32 30 45 14 64 6Z",
    "nonzero",
  ),
  g("sun", "Sun", "Symbols", sun(), "nonzero"),
  g(
    "eye",
    "Eye",
    "Symbols",
    "M4 50C18 26 34 16 50 16C66 16 82 26 96 50C82 74 66 84 50 84C34 84 18 74 4 50Z" +
      circle(50, 50, 20) +
      circle(50, 50, 9),
    "evenodd",
    0.68,
  ),
  g(
    "arrow",
    "Arrow",
    "Symbols",
    "M8 72C28 32 60 22 84 30L80 18L98 37L74 48L79 37C58 31 36 40 17 77Z",
    "nonzero",
    0.6,
  ),
  g(
    "peace",
    "Peace",
    "Symbols",
    circle(50, 50, 47) +
      circle(50, 50, 39, true) +
      "M46 8H54V92H46Z" +
      "M48 52L53 57L24 84L19 79Z" +
      "M52 52L47 57L76 84L81 79Z",
    "nonzero",
  ),

  // Shapes
  g("burst", "Burst", "Shapes", star(18, 50, 41, -90), "nonzero"),
  g("circle", "Circle", "Shapes", circle(50, 50, 48), "nonzero"),
  g("ring", "Ring", "Shapes", circle(50, 50, 48) + circle(50, 50, 42), "evenodd"),
  g("pill", "Pill", "Shapes", roundRect(2, 30, 96, 40, 20), "nonzero", 0.4),
  g("banner", "Banner", "Shapes", "M2 32H98L90 50L98 68H2L10 50Z", "nonzero", 0.36),
  g("box", "Box", "Shapes", roundRect(4, 4, 92, 92, 4) + roundRect(10, 10, 80, 80, 1), "evenodd"),
];

export const GRAPHIC_BY_ID: Record<string, Graphic> = Object.fromEntries(GRAPHICS.map((x) => [x.id, x]));

export function graphicFor(id: string): Graphic {
  return GRAPHIC_BY_ID[id] ?? GRAPHICS[0];
}

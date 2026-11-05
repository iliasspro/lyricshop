// Builds the Lyricshop identity as pure vector files.
//   node scripts/build-brand.mjs
// Outputs public/brand/*.svg, src/app/icon.svg and src/components/brand/logo-data.ts
// (outlined path data, so the logo never depends on a web font loading).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const out = (p) => path.join(ROOT, p);

export const COLORS = { ink: "#0F0E0D", bone: "#F3EEE5", red: "#FF4A1C" };

function loadFont(file) {
  const buf = readFileSync(out(`scripts/fonts/${file}`));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
const display = loadFont("BricolageGrotesque-ExtraBold.ttf");
const bold = loadFont("BricolageGrotesque-Bold.ttf");

const r2 = (n) => Math.round(n * 100) / 100;
// opentype.js 2's shaper trips over some of Bricolage's contextual lookups; a logo
// needs no shaping, so map characters straight to glyphs.
const toGlyphs = (font, s) => [...s].map((ch) => font.charToGlyph(ch));

// ---------------------------------------------------------------------------
// The mark: an opening quotation mark whose two "balls" are vinyl records.
// Lyrics live between quotes; the records say where they come from.
// ---------------------------------------------------------------------------
const GLYPH_DX = 94;
const BALL = { cx: 50, cy: 78, r: 38 };
const TAIL = "M12 78C12 41 34 13 77 4L83 12.5C62 19.5 47.5 30 45 45Z";
export const MARK_VIEWBOX = "8 0 178 120";

function arc(cx, cy, r, a0, a1) {
  const rad = (a) => ((a - 90) * Math.PI) / 180;
  const p = (a) => [r2(cx + r * Math.cos(rad(a))), r2(cy + r * Math.sin(rad(a)))];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}`;
}

function recordGlyph(dx, { body, groove, label, hole }, detail = true) {
  const { cx, cy, r } = BALL;
  const x = cx + dx;
  const parts = [
    `<path d="${TAIL}" transform="translate(${dx} 0)" fill="${body}"/>`,
    `<circle cx="${x}" cy="${cy}" r="${r}" fill="${body}"/>`,
  ];
  if (detail) {
    for (const gr of [32.5, 27.5, 22.5]) {
      parts.push(`<circle cx="${x}" cy="${cy}" r="${gr}" fill="none" stroke="${groove}" stroke-opacity=".28" stroke-width="1.3"/>`);
    }
    // light catching the grooves
    parts.push(`<path d="${arc(x, cy, 29.5, 300, 338)}" fill="none" stroke="${groove}" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>`);
    parts.push(`<path d="${arc(x, cy, 29.5, 120, 158)}" fill="none" stroke="${groove}" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/>`);
  }
  parts.push(`<circle cx="${x}" cy="${cy}" r="14" fill="${label}"/>`);
  parts.push(`<circle cx="${x}" cy="${cy}" r="2.8" fill="${hole}"/>`);
  return parts.join("");
}

function markInner(theme = "ink", detail = true) {
  const c =
    theme === "ink"
      ? { body: COLORS.ink, groove: COLORS.bone, label: COLORS.red, hole: COLORS.bone }
      : { body: COLORS.bone, groove: COLORS.ink, label: COLORS.red, hole: COLORS.ink };
  return recordGlyph(0, c, detail) + recordGlyph(GLYPH_DX, c, detail);
}

// ---------------------------------------------------------------------------
// Wordmark: "lyrıcshop" in Bricolage Grotesque ExtraBold (display optical size),
// dotless i crowned with the red record light.
// ---------------------------------------------------------------------------
const WORD = "lyrıcshop";
const SIZE = 100;
const TRACKING = -2.2; // units at size 100

function layoutWord() {
  const glyphs = toGlyphs(display, WORD);
  const scale = SIZE / display.unitsPerEm;
  let x = 0;
  const paths = [];
  let dot = null;
  glyphs.forEach((g, i) => {
    // opentype.js 2 emits NaN for glyphs drawn away from the origin, so draw at 0 and shift.
    const p = g.getPath(0, 0, SIZE);
    const ox = x;
    paths.push(transformPath(p.commands, (px, py) => [px + ox, py]));
    if (WORD[i] === "ı") {
      const bb = p.getBoundingBox();
      dot = { cx: r2(ox + (bb.x1 + bb.x2) / 2), cy: -65.5, r: 9.2 };
    }
    const next = glyphs[i + 1];
    const kern = next ? display.getKerningValue(g, next) : 0;
    x += (g.advanceWidth + kern) * scale + (next ? TRACKING : 0);
  });
  return { d: paths.join(""), dot, width: x };
}

const word = layoutWord();
const WORD_TOP = -75; // dot top
const WORD_BOTTOM = 26; // descender of y/p
const WORD_VIEWBOX = `-2 ${WORD_TOP - 2} ${r2(word.width + 4)} ${WORD_BOTTOM - WORD_TOP + 4}`;

function wordInner(fill, dotFill = COLORS.red) {
  const { cx, cy, r } = word.dot;
  return `<path d="${word.d}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${dotFill}"/>`;
}

// ---------------------------------------------------------------------------
// Horizontal lockup: mark sits from x-height-ish top to baseline.
// ---------------------------------------------------------------------------
const MARK_SCALE = 0.62; // 112 units of mark → ~70 (ascender height)
const LOCKUP_GAP = 16;
function lockupInner(theme) {
  const fill = theme === "ink" ? COLORS.ink : COLORS.bone;
  const markW = 174 * MARK_SCALE; // drawn width (12..186)
  const markX = -12 * MARK_SCALE;
  const markY = -116 * MARK_SCALE; // bottom of balls on baseline
  const wordX = markW + LOCKUP_GAP;
  return {
    inner:
      `<g transform="translate(${r2(markX)} ${r2(markY)}) scale(${MARK_SCALE})">${markInner(theme)}</g>` +
      `<g transform="translate(${r2(wordX)} 0)">${wordInner(fill)}</g>`,
    width: wordX + word.width,
  };
}

// ---------------------------------------------------------------------------
// Badge: a record label. Ring text is outlined glyph by glyph along the circle.
// ---------------------------------------------------------------------------
function transformPath(cmds, fn) {
  return cmds
    .map((c) => {
      const pt = (x, y) => fn(x, y).map(r2).join(" ");
      switch (c.type) {
        case "M": return `M${pt(c.x, c.y)}`;
        case "L": return `L${pt(c.x, c.y)}`;
        case "Q": return `Q${pt(c.x1, c.y1)} ${pt(c.x, c.y)}`;
        case "C": return `C${pt(c.x1, c.y1)} ${pt(c.x2, c.y2)} ${pt(c.x, c.y)}`;
        case "Z": return "Z";
        default: return "";
      }
    })
    .join("");
}

function ringText(segments, { cx, cy, radius, size, tracking, font, sepGap }) {
  // Lay segments out evenly around the full circle, separated by dots.
  const scale = size / font.unitsPerEm;
  const measured = segments.map((s) => {
    const glyphs = toGlyphs(font, s);
    const adv = glyphs.map((g) => g.advanceWidth * scale + tracking);
    return { s, glyphs, adv, len: adv.reduce((a, b) => a + b, 0) - tracking };
  });
  const circumference = 2 * Math.PI * radius;
  const textLen = measured.reduce((a, m) => a + m.len, 0);
  const gap = (circumference - textLen) / segments.length;
  let paths = "";
  const dots = [];
  let s = -measured[0].len / 2; // first segment centered at top
  for (const m of measured) {
    m.glyphs.forEach((g, i) => {
      const center = s + m.adv[i] / 2 - tracking / 2;
      const theta = center / radius;
      const p = g.getPath(0, 0, size);
      const half = (g.advanceWidth * scale) / 2;
      const cos = Math.cos(theta), sin = Math.sin(theta);
      paths += transformPath(p.commands, (x0, y) => {
        const x = x0 - half;
        return [cx + radius * sin + x * cos - y * sin, cy - radius * cos + x * sin + y * cos];
      });
      s += m.adv[i];
    });
    s -= tracking;
    const dotCenter = s + gap / 2;
    const t = dotCenter / radius;
    const dr = radius + size * 0.33;
    dots.push([r2(cx + dr * Math.sin(t)), r2(cy - dr * Math.cos(t))]);
    s += gap;
  }
  void sepGap;
  return { paths, dots };
}

function badgeSvg() {
  const C = 200;
  const ring = ringText(["LYRICSHOP", "WEAR YOUR WORDS", "MADE BY ARTISTS"], {
    cx: C, cy: C, radius: 150, size: 30, tracking: 3.2, font: bold,
  });
  const markScale = 0.95;
  const mw = 174 * markScale, mh = 112 * markScale;
  return svg(`0 0 ${C * 2} ${C * 2}`, [
    `<circle cx="${C}" cy="${C}" r="${C}" fill="${COLORS.ink}"/>`,
    `<circle cx="${C}" cy="${C}" r="${C - 9}" fill="none" stroke="${COLORS.bone}" stroke-opacity=".18" stroke-width="1.5"/>`,
    `<circle cx="${C}" cy="${C}" r="128" fill="none" stroke="${COLORS.bone}" stroke-opacity=".9" stroke-width="2"/>`,
    `<path d="${ring.paths}" fill="${COLORS.bone}"/>`,
    ...ring.dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${COLORS.red}"/>`),
    `<g transform="translate(${r2(C - mw / 2 - 12 * markScale)} ${r2(C - mh / 2 - 4 * markScale)}) scale(${markScale})">${markInner("bone")}</g>`,
  ].join(""), "Lyricshop badge");
}

// ---------------------------------------------------------------------------
function svg(viewBox, inner, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`;
}

mkdirSync(out("public/brand"), { recursive: true });
mkdirSync(out("src/components/brand"), { recursive: true });

const files = {
  "public/brand/lyricshop-mark.svg": svg(MARK_VIEWBOX, markInner("ink"), "Lyricshop mark"),
  "public/brand/lyricshop-mark-bone.svg": svg(MARK_VIEWBOX, markInner("bone"), "Lyricshop mark"),
  "public/brand/lyricshop-wordmark.svg": svg(WORD_VIEWBOX, wordInner(COLORS.ink), "Lyricshop"),
  "public/brand/lyricshop-wordmark-bone.svg": svg(WORD_VIEWBOX, wordInner(COLORS.bone), "Lyricshop"),
  "public/brand/lyricshop-badge.svg": badgeSvg(),
};
for (const theme of ["ink", "bone"]) {
  const l = lockupInner(theme);
  const vb = `-2 ${WORD_TOP - 2} ${r2(l.width + 4)} ${WORD_BOTTOM - WORD_TOP + 4}`;
  files[`public/brand/lyricshop-logo${theme === "bone" ? "-bone" : ""}.svg`] = svg(vb, l.inner, "Lyricshop");
}
// Favicon: bone mark on an ink tile, simplified grooves.
files["src/app/icon.svg"] = svg(
  "0 0 64 64",
  `<rect width="64" height="64" rx="14" fill="${COLORS.ink}"/>` +
    `<g transform="translate(5.2 13) scale(0.315)">${markInner("bone", false)}</g>`,
  "Lyricshop",
);

for (const [file, content] of Object.entries(files)) {
  writeFileSync(out(file), content);
  console.log("wrote", file, `${(content.length / 1024).toFixed(1)} KB`);
}

// Path data for the React <Logo/> components.
const lockup = lockupInner("ink");
const data = `// Generated by scripts/build-brand.mjs — do not edit by hand.
export const BRAND_COLORS = ${JSON.stringify(COLORS)} as const;

export const MARK = {
  viewBox: ${JSON.stringify(MARK_VIEWBOX)},
  glyphDx: ${GLYPH_DX},
  tail: ${JSON.stringify(TAIL)},
  ball: ${JSON.stringify(BALL)},
} as const;

export const WORDMARK = {
  viewBox: ${JSON.stringify(WORD_VIEWBOX)},
  d: ${JSON.stringify(word.d)},
  dot: ${JSON.stringify(word.dot)},
  width: ${r2(word.width)},
  top: ${WORD_TOP},
  bottom: ${WORD_BOTTOM},
} as const;

export const LOCKUP = {
  markScale: ${MARK_SCALE},
  gap: ${LOCKUP_GAP},
  width: ${r2(lockup.width)},
} as const;
`;
writeFileSync(out("src/components/brand/logo-data.ts"), data);
console.log("wrote src/components/brand/logo-data.ts");

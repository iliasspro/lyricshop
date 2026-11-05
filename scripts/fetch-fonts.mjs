// Downloads the customizer's design fonts (latin subset, woff2) from Google Fonts
// and the static TTF instances the logo builder needs. Run: node scripts/fetch-fonts.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const WOFF2_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const TTF_UA = "Wget/1.21"; // a non-browser UA gets static TrueType instances

// slug, Google family, css2 axis spec, css family name, category, weight, style
export const DESIGN_FONTS = [
  ["anton", "Anton", "", "Anton", "Condensed", 400, "normal"],
  ["bebas-neue", "Bebas Neue", "", "Bebas Neue", "Condensed", 400, "normal"],
  ["archivo-black", "Archivo Black", "", "Archivo Black", "Grotesk", 400, "normal"],
  ["bricolage", "Bricolage Grotesque", ":opsz,wght@96,800", "Bricolage Display", "Grotesk", 800, "normal"],
  ["bungee", "Bungee", "", "Bungee", "Block", 400, "normal"],
  ["instrument-serif", "Instrument Serif", "", "Instrument Serif", "Serif", 400, "normal"],
  ["instrument-serif-italic", "Instrument Serif", ":ital@1", "Instrument Serif Italic", "Serif", 400, "italic"],
  ["playfair-black-italic", "Playfair Display", ":ital,wght@1,900", "Playfair Black Italic", "Serif", 900, "italic"],
  ["abril-fatface", "Abril Fatface", "", "Abril Fatface", "Serif", 400, "normal"],
  ["dm-serif-display", "DM Serif Display", "", "DM Serif Display", "Serif", 400, "normal"],
  ["shrikhand", "Shrikhand", "", "Shrikhand", "Retro", 400, "normal"],
  ["monoton", "Monoton", "", "Monoton", "Retro", 400, "normal"],
  ["rubik-glitch", "Rubik Glitch", "", "Rubik Glitch", "Retro", 400, "normal"],
  ["permanent-marker", "Permanent Marker", "", "Permanent Marker", "Handwritten", 400, "normal"],
  ["caveat", "Caveat", ":wght@700", "Caveat", "Handwritten", 700, "normal"],
  ["rock-salt", "Rock Salt", "", "Rock Salt", "Handwritten", 400, "normal"],
  ["yellowtail", "Yellowtail", "", "Yellowtail", "Script", 400, "normal"],
  ["pacifico", "Pacifico", "", "Pacifico", "Script", 400, "normal"],
  ["unifraktur", "UnifrakturMaguntia", "", "UnifrakturMaguntia", "Gothic", 400, "normal"],
  ["pirata-one", "Pirata One", "", "Pirata One", "Gothic", 400, "normal"],
  ["special-elite", "Special Elite", "", "Special Elite", "Typewriter", 400, "normal"],
  ["space-mono", "Space Mono", ":wght@700", "Space Mono", "Typewriter", 700, "normal"],
];

async function css(url, ua) {
  const res = await fetch(url, { headers: { "User-Agent": ua } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function latinBlock(cssText) {
  // Google returns one @font-face per unicode subset, each preceded by a /* subset */ comment.
  const blocks = cssText.split("/* ").slice(1);
  const latin = blocks.find((b) => b.startsWith("latin */")) ?? cssText;
  const url = latin.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error("no font url in css");
  return url;
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  return buf.length;
}

const family = (f) => f.replaceAll(" ", "+");

for (const [slug, gFamily, axes] of DESIGN_FONTS) {
  const url = `https://fonts.googleapis.com/css2?family=${family(gFamily)}${axes}&display=swap`;
  const fontUrl = latinBlock(await css(url, WOFF2_UA));
  const size = await download(fontUrl, path.join(ROOT, "public/fonts/design", `${slug}.woff2`));
  console.log(`design  ${slug.padEnd(24)} ${(size / 1024).toFixed(1)} KB`);
}

// Static TTF instances for outlining the logo (opentype.js cannot read woff2).
const LOGO_FONTS = [
  ["BricolageGrotesque-ExtraBold.ttf", "Bricolage Grotesque", ":opsz,wght@96,800"],
  ["BricolageGrotesque-Bold.ttf", "Bricolage Grotesque", ":opsz,wght@24,700"],
];
for (const [file, gFamily, axes] of LOGO_FONTS) {
  const url = `https://fonts.googleapis.com/css2?family=${family(gFamily)}${axes}`;
  const text = await css(url, TTF_UA);
  const fontUrl = text.match(/url\((https:[^)]+)\)/)?.[1];
  const size = await download(fontUrl, path.join(ROOT, "scripts/fonts", file));
  console.log(`logo    ${file.padEnd(24)} ${(size / 1024).toFixed(1)} KB`);
}

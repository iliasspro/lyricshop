import { graphic, text, type Design, type GraphicLayer, type TextLayer } from "../design";
import type { GarmentId } from "../garments";

export type Badge = "new" | "bestseller" | "limited" | "low-stock";

export type Product = {
  slug: string;
  title: string;
  creator: string;
  collection: string;
  garment: GarmentId;
  price: number;
  compareAt?: number;
  colors: string[];
  description: string;
  printMethod: string;
  design: Design;
  lifestyle?: string;
  badges: Badge[];
  rating: number;
  reviews: number;
  /** Units sold, used for "bestselling" sort. Demo numbers. */
  sold: number;
  /** Days since release, used for "newest" sort. */
  age: number;
};

// Catalog designs need stable ids (they render on the server and the client).
type TextInit = Partial<TextLayer> & { text: string };
type GraphicInit = Partial<GraphicLayer> & { graphic: string };
const t = (id: string, init: TextInit) => text({ id, ...init });
const g = (id: string, init: GraphicInit) => graphic({ id, ...init });

// "auto" ink resolves to bone on dark cloth and ink-black on light cloth.
const AUTO = "auto";
const RED = "#FF4A1C";
const GOLD = "#C9A227";

export const PRODUCTS: Product[] = [
  {
    slug: "loud-hearted-hoodie",
    title: "Loud Hearted Hoodie",
    creator: "lyricshop",
    collection: "originals",
    garment: "hoodie",
    price: 78,
    colors: ["black", "bone", "red", "charcoal"],
    description:
      "Our flagship line, set big in a high-contrast serif across 450 gsm fleece. For the ones who feel everything at full volume.",
    printMethod: "Water-based screen print, cured soft to the hand",
    design: {
      front: [t("lh1", { text: "LOUD\nHEARTED", font: "dm-serif-display", size: 0.2, y: 0.44, color: AUTO, lineHeight: 0.92 })],
      back: [t("lh2", { text: "feel everything at full volume", font: "instrument-serif-italic", size: 0.07, y: 0.08, color: AUTO })],
    },
    lifestyle: "/images/campaign-rooftop.jpg",
    badges: ["bestseller"],
    rating: 4.9,
    reviews: 412,
    sold: 3120,
    age: 40,
  },
  {
    slug: "no-skips-hoodie",
    title: "No Skips Hoodie",
    creator: "rumi.loops",
    collection: "night-shift",
    garment: "hoodie",
    price: 82,
    colors: ["black", "charcoal", "navy"],
    description:
      "Puff-printed in on-air red. A whole album with no filler, no skips: worn on every walk home after a session.",
    printMethod: "Raised puff print",
    design: {
      front: [t("ns1", { text: "NO\nSKIPS", font: "anton", size: 0.3, y: 0.46, color: RED, lineHeight: 0.86 })],
      back: [0, 1, 2, 3, 4].map((i) =>
        t(`ns-b${i}`, {
          text: "NO SKIPS",
          font: "anton",
          size: 0.2,
          y: 0.14 + i * 0.16,
          color: RED,
          opacity: [1, 0.72, 0.48, 0.28, 0.14][i],
        }),
      ),
    },
    lifestyle: "/images/collection-night-shift.jpg",
    badges: ["new"],
    rating: 4.8,
    reviews: 96,
    sold: 1180,
    age: 6,
  },
  {
    slug: "hum-it-back-crewneck",
    title: "Hum It Back Crewneck",
    creator: "mayaokafor",
    collection: "paper-hearts",
    garment: "crewneck",
    price: 68,
    colors: ["bone", "sand", "heather", "sage"],
    description:
      "Maya's handwriting, lifted straight from her lyric notebook and printed small across the chest. A quiet one.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("hb1", { text: "hum it back to me", font: "caveat", size: 0.13, y: 0.24, rotation: -4, color: AUTO }),
        g("hb2", { graphic: "heart", size: 0.07, x: 0.86, y: 0.16, rotation: 12, color: RED }),
      ],
      back: [],
    },
    lifestyle: "/images/collection-paper-hearts.jpg",
    badges: [],
    rating: 4.9,
    reviews: 188,
    sold: 1640,
    age: 22,
  },
  {
    slug: "one-more-take-tee",
    title: "One More Take Tee",
    creator: "kaimoreno",
    collection: "basement-tapes",
    garment: "tee",
    price: 38,
    colors: ["charcoal", "black", "bone", "red"],
    description:
      "Stacked block letters on a garment-dyed heavyweight tee, inspired by the 47 takes it took to finish one song.",
    printMethod: "Distressed water-based screen print",
    design: {
      front: [t("om1", { text: "ONE\nMORE\nTAKE", font: "archivo-black", size: 0.24, y: 0.42, color: AUTO, lineHeight: 0.88 })],
      back: [
        g("om2", { graphic: "circle", size: 0.06, x: 0.3, y: 0.08, color: RED }),
        t("om3", { text: "REC  TAKE 47", font: "space-mono", size: 0.07, x: 0.56, y: 0.08, color: AUTO, letterSpacing: 0.08 }),
      ],
    },
    lifestyle: "/images/collection-basement-tapes.jpg",
    badges: ["bestseller"],
    rating: 4.7,
    reviews: 264,
    sold: 2410,
    age: 55,
  },
  {
    slug: "say-it-back-hoodie",
    title: "Say It Back Hoodie",
    creator: "devraman",
    collection: "night-shift",
    garment: "hoodie",
    price: 82,
    colors: ["red", "bone", "sand"],
    description:
      "The punchline lives on the back. A small italic whisper on the chest, the whole verse in giant condensed type behind you.",
    printMethod: "Plastisol screen print",
    design: {
      front: [t("sb1", { text: "say it back", font: "instrument-serif-italic", size: 0.12, y: 0.2, color: "#161515" })],
      back: [t("sb2", { text: "SAY IT\nBACK", font: "anton", size: 0.42, y: 0.44, color: "#161515", lineHeight: 0.84 })],
    },
    lifestyle: "/images/lookbook-say-it-back.jpg",
    badges: ["limited"],
    rating: 4.9,
    reviews: 77,
    sold: 640,
    age: 12,
  },
  {
    slug: "b-side-hoodie",
    title: "B-Side Varsity Hoodie",
    creator: "nourafterdark",
    collection: "originals",
    garment: "hoodie",
    price: 78,
    colors: ["bone", "heather", "black"],
    description:
      "Arched varsity type for people who love the deep cuts more than the singles. Nour's favorite songs never made the radio.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("bs1", { text: "B-SIDE", font: "abril-fatface", size: 0.26, y: 0.42, curve: 36, color: "#D23A1E" }),
        t("bs2", { text: "deep cuts only", font: "instrument-serif-italic", size: 0.075, y: 0.7, color: "#D23A1E" }),
      ],
      back: [],
    },
    lifestyle: "/images/lookbook-b-side.jpg",
    badges: [],
    rating: 4.8,
    reviews: 143,
    sold: 980,
    age: 31,
  },
  {
    slug: "liner-notes-tee",
    title: "Liner Notes Tee",
    creator: "junebug",
    collection: "paper-hearts",
    garment: "tee",
    price: 36,
    colors: ["black", "bone", "sand"],
    description:
      "A small serif chest print up front; on the back, June's liner notes, typed out like the inside of an old record sleeve.",
    printMethod: "Water-based screen print",
    design: {
      front: [t("ln1", { text: "liner notes.", font: "instrument-serif", size: 0.1, y: 0.12, color: AUTO })],
      back: [
        t("ln2", {
          text: "side a — track one\nwritten at the kitchen table\nrecorded in a single take\nsung for whoever needs it",
          font: "special-elite",
          size: 0.052,
          y: 0.16,
          lineHeight: 1.6,
          color: AUTO,
        }),
      ],
    },
    lifestyle: "/images/lookbook-liner-notes.jpg",
    badges: [],
    rating: 4.8,
    reviews: 121,
    sold: 1020,
    age: 28,
  },
  {
    slug: "wear-your-words-tee",
    title: "Wear Your Words Tee",
    creator: "lyricshop",
    collection: "originals",
    garment: "tee",
    price: 34,
    colors: ["bone", "black", "white", "red"],
    description: "The motto, hand-pulled. Our most-worn tee: boxy, heavy and printed in thick block letters.",
    printMethod: "Hand-pulled screen print",
    design: {
      front: [t("wy1", { text: "WEAR\nYOUR\nWORDS", font: "archivo-black", size: 0.24, y: 0.42, color: AUTO, lineHeight: 0.86 })],
      back: [
        g("wy2", { graphic: "quote", size: 0.26, y: 0.12, color: RED }),
        t("wy3", { text: "lyricshop", font: "bricolage", size: 0.1, y: 0.26, color: AUTO, letterSpacing: -0.02 }),
      ],
    },
    lifestyle: "/images/studio-flatlay.jpg",
    badges: ["bestseller"],
    rating: 4.9,
    reviews: 538,
    sold: 4210,
    age: 70,
  },
  {
    slug: "chorus-is-us-crewneck",
    title: "The Chorus Is Us Crewneck",
    creator: "lyricshop",
    collection: "originals",
    garment: "crewneck",
    price: 68,
    colors: ["black", "bone", "heather"],
    description:
      "For the last song of the night, when the whole room sings the hook back to the stage. A waveform from a real crowd recording runs underneath.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("ch1", { text: "THE CHORUS\nIS US", font: "bebas-neue", size: 0.2, y: 0.38, color: AUTO, lineHeight: 0.9 }),
        g("ch2", { graphic: "wave", size: 0.52, y: 0.72, color: RED }),
      ],
      back: [],
    },
    lifestyle: "/images/crowd.jpg",
    badges: ["new"],
    rating: 4.8,
    reviews: 58,
    sold: 520,
    age: 4,
  },
  {
    slug: "static-soft-light-longsleeve",
    title: "Static & Soft Light Long Sleeve",
    creator: "rumi.loops",
    collection: "night-shift",
    garment: "longsleeve",
    price: 48,
    colors: ["black", "navy", "bone"],
    description:
      "Neon-line lettering over a waveform pulled from Rumi's modular rig. Looks best under streetlights.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("ss1", { text: "static &\nsoft light", font: "monoton", size: 0.1, y: 0.34, color: RED, lineHeight: 1.25 }),
        g("ss2", { graphic: "wave", size: 0.6, y: 0.72, color: AUTO, opacity: 0.9 }),
      ],
      back: [],
    },
    badges: ["new"],
    rating: 4.7,
    reviews: 39,
    sold: 310,
    age: 9,
  },
  {
    slug: "midnight-in-the-mix-tee",
    title: "Midnight In The Mix Tee",
    creator: "rumi.loops",
    collection: "night-shift",
    garment: "tee",
    price: 38,
    colors: ["black", "navy", "charcoal"],
    description: "A highlighter-yellow moon over chunky block type. Mixed down at 2:47 a.m.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        g("mm1", { graphic: "moon", size: 0.3, y: 0.28, color: "#F5D547" }),
        t("mm2", { text: "MIDNIGHT\nIN THE MIX", font: "bungee", size: 0.11, y: 0.66, color: AUTO, lineHeight: 1.05 }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.6,
    reviews: 71,
    sold: 690,
    age: 45,
  },
  {
    slug: "off-key-tee",
    title: "Off-Key & On Purpose Tee",
    creator: "kaimoreno",
    collection: "basement-tapes",
    garment: "tee",
    price: 36,
    colors: ["bone", "white", "heather", "red"],
    description: "Scrawled in marker the night before the gig. Wrong notes, right reasons.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("ok1", { text: "off-key &\non purpose", font: "permanent-marker", size: 0.14, y: 0.42, rotation: -6, color: AUTO, lineHeight: 1.05 }),
        g("ok2", { graphic: "bolt", size: 0.14, x: 0.84, y: 0.15, rotation: 12, color: RED }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.7,
    reviews: 102,
    sold: 870,
    age: 38,
  },
  {
    slug: "written-in-the-margins-crewneck",
    title: "Written In The Margins Crewneck",
    creator: "devraman",
    collection: "paper-hearts",
    garment: "crewneck",
    price: 72,
    colors: ["sand", "black", "bone", "sage"],
    description: "Typewriter type and a big red quote mark. Where Dev keeps the lines that are too true for the verse.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        g("wm1", { graphic: "quote", size: 0.24, x: 0.26, y: 0.2, color: RED }),
        t("wm2", { text: "written in\nthe margins", font: "special-elite", size: 0.1, y: 0.46, color: AUTO, lineHeight: 1.25 }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.9,
    reviews: 84,
    sold: 560,
    age: 19,
  },
  {
    slug: "velvet-hours-longsleeve",
    title: "Velvet Hours Long Sleeve",
    creator: "nourafterdark",
    collection: "night-shift",
    garment: "longsleeve",
    price: 52,
    colors: ["burgundy", "black", "bone"],
    description: "A velvet-room script with gold sparkles, the color of the curtain at Nour's Thursday residency.",
    printMethod: "Water-based screen print with metallic gold",
    design: {
      front: [
        t("vh1", { text: "Velvet Hours", font: "yellowtail", size: 0.17, y: 0.4, rotation: -5, color: AUTO }),
        g("vh2", { graphic: "sparkle", size: 0.09, x: 0.86, y: 0.26, color: GOLD }),
        g("vh3", { graphic: "sparkle", size: 0.055, x: 0.14, y: 0.56, color: GOLD }),
      ],
      back: [],
    },
    badges: ["limited"],
    rating: 4.9,
    reviews: 46,
    sold: 330,
    age: 16,
  },
  {
    slug: "porch-light-tee",
    title: "Porch Light Tee",
    creator: "junebug",
    collection: "paper-hearts",
    garment: "tee",
    price: 34,
    colors: ["sand", "sage", "bone", "white"],
    description: "A warm sun over a slow-song couplet. Best worn barefoot.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        g("pl1", { graphic: "sun", size: 0.3, y: 0.26, color: "#D23A1E" }),
        t("pl2", { text: "porch light,\nslow song", font: "instrument-serif-italic", size: 0.12, y: 0.64, color: AUTO, lineHeight: 1.05 }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.8,
    reviews: 67,
    sold: 450,
    age: 52,
  },
  {
    slug: "heart-on-the-hook-tote",
    title: "Heart On The Hook Tote",
    creator: "mayaokafor",
    collection: "paper-hearts",
    garment: "tote",
    price: 28,
    colors: ["natural", "black", "bone"],
    description: "Heavy canvas for records, notebooks and everything else you carry around.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("ho1", { text: "heart on\nthe hook", font: "pacifico", size: 0.14, y: 0.4, color: AUTO, lineHeight: 1.15 }),
        g("ho2", { graphic: "heart", size: 0.12, y: 0.76, color: RED }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.9,
    reviews: 212,
    sold: 1900,
    age: 60,
  },
  {
    slug: "loop-the-good-part-tote",
    title: "Loop The Good Part Tote",
    creator: "rumi.loops",
    collection: "night-shift",
    garment: "tote",
    price: 28,
    colors: ["natural", "black"],
    description: "A cassette, a pencil and the best eight bars of your life on repeat.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        g("lg1", { graphic: "cassette", size: 0.52, y: 0.42, color: AUTO }),
        t("lg2", { text: "LOOP THE GOOD PART", font: "space-mono", size: 0.062, y: 0.8, color: AUTO, letterSpacing: 0.1 }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.7,
    reviews: 90,
    sold: 760,
    age: 33,
  },
  {
    slug: "loud-hearted-cap",
    title: "Loud Hearted Cap",
    creator: "lyricshop",
    collection: "originals",
    garment: "cap",
    price: 32,
    colors: ["black", "bone", "red", "navy"],
    description: "Our quote-mark records embroidered up front. Washed twill that only gets better.",
    printMethod: "Flat embroidery",
    design: {
      front: [
        g("lc1", { graphic: "quote", size: 0.42, y: 0.36, color: RED }),
        t("lc2", { text: "LOUD HEARTED", font: "bebas-neue", size: 0.15, y: 0.76, color: AUTO, letterSpacing: 0.06 }),
      ],
      back: [],
    },
    badges: ["bestseller"],
    rating: 4.8,
    reviews: 305,
    sold: 2650,
    age: 64,
  },
  {
    slug: "no-filler-cap",
    title: "All Verse No Filler Cap",
    creator: "devraman",
    collection: "basement-tapes",
    garment: "cap",
    price: 32,
    colors: ["black", "olive", "sand"],
    description: "Stacked block embroidery. Says exactly what it means.",
    printMethod: "Flat embroidery",
    design: {
      front: [t("nf1", { text: "ALL VERSE\nNO FILLER", font: "archivo-black", size: 0.13, y: 0.5, color: AUTO, lineHeight: 1.02 })],
      back: [],
    },
    badges: [],
    rating: 4.6,
    reviews: 54,
    sold: 410,
    age: 24,
  },
  {
    slug: "sing-it-like-you-mean-it-hoodie",
    title: "Sing It Like You Mean It Hoodie",
    creator: "mayaokafor",
    collection: "paper-hearts",
    garment: "hoodie",
    price: 78,
    colors: ["lilac", "sage", "bone", "black"],
    description: "Big retro script and a ribbon mic, for the car-singers and the shower-belters.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("si1", { text: "sing it like\nyou mean it", font: "shrikhand", size: 0.12, y: 0.38, color: AUTO, lineHeight: 1.05 }),
        g("si2", { graphic: "mic", size: 0.15, y: 0.82, color: RED }),
      ],
      back: [],
    },
    badges: ["new"],
    rating: 4.9,
    reviews: 33,
    sold: 260,
    age: 3,
  },
  {
    slug: "minor-key-crewneck",
    title: "Minor Key Crewneck",
    creator: "nourafterdark",
    collection: "night-shift",
    garment: "crewneck",
    price: 68,
    colors: ["navy", "black", "bone"],
    description: "Heavy italic serif and gold notes. Written after the last set, before the last train.",
    printMethod: "Water-based screen print with metallic gold",
    design: {
      front: [
        t("mk1", { text: "after midnight,\nin a minor key", font: "playfair-black-italic", size: 0.1, y: 0.38, color: AUTO, lineHeight: 1.12 }),
        g("mk2", { graphic: "notes", size: 0.15, y: 0.72, color: GOLD }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.8,
    reviews: 62,
    sold: 480,
    age: 26,
  },
  {
    slug: "basement-tapes-longsleeve",
    title: "Basement Tapes Long Sleeve",
    creator: "kaimoreno",
    collection: "basement-tapes",
    garment: "longsleeve",
    price: 48,
    colors: ["black", "charcoal"],
    description: "Blackletter over a red record, cassette on the back. The official merch of Kai's basement.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("bt1", { text: "Basement Tapes", font: "unifraktur", size: 0.14, y: 0.16, color: AUTO }),
        g("bt2", { graphic: "vinyl", size: 0.52, y: 0.6, color: RED }),
      ],
      back: [g("bt3", { graphic: "cassette", size: 0.36, y: 0.2, color: AUTO })],
    },
    badges: ["low-stock"],
    rating: 4.7,
    reviews: 48,
    sold: 390,
    age: 49,
  },
  {
    slug: "soft-spoken-tee",
    title: "Soft Spoken, Loud Hearted Tee",
    creator: "mayaokafor",
    collection: "originals",
    garment: "tee",
    price: 36,
    colors: ["white", "bone", "lilac", "black"],
    description: "Two voices, one tee: a whisper in italic serif and a shout in condensed red.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("sp1", { text: "soft spoken,", font: "instrument-serif-italic", size: 0.12, y: 0.3, color: AUTO }),
        t("sp2", { text: "LOUD HEARTED", font: "anton", size: 0.17, y: 0.46, color: RED }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.8,
    reviews: 129,
    sold: 1130,
    age: 35,
  },
  {
    slug: "pirate-radio-tee",
    title: "Pirate Radio Tee",
    creator: "devraman",
    collection: "basement-tapes",
    garment: "tee",
    price: 36,
    colors: ["black", "bone", "charcoal"],
    description: "Arched gothic type and a ribbon mic, broadcasting from a rooftop antenna at 88.1.",
    printMethod: "Water-based screen print",
    design: {
      front: [
        t("pr1", { text: "PIRATE RADIO", font: "pirata-one", size: 0.17, y: 0.2, curve: 30, color: AUTO }),
        g("pr2", { graphic: "mic", size: 0.28, y: 0.54, color: RED }),
        t("pr3", { text: "88.1 FM — LATE NIGHT", font: "space-mono", size: 0.05, y: 0.84, color: AUTO, letterSpacing: 0.12 }),
      ],
      back: [],
    },
    badges: [],
    rating: 4.7,
    reviews: 75,
    sold: 600,
    age: 42,
  },
];

export const PRODUCT_BY_SLUG: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return PRODUCT_BY_SLUG[slug];
}

export function productsByCreator(handle: string): Product[] {
  return PRODUCTS.filter((p) => p.creator === handle);
}

export function productsInCollection(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.collection === slug);
}

export function relatedProducts(product: Product, count = 4): Product[] {
  const score = (p: Product) =>
    (p.collection === product.collection ? 2 : 0) + (p.creator === product.creator ? 1 : 0) + (p.garment === product.garment ? 0.5 : 0);
  return PRODUCTS.filter((p) => p.slug !== product.slug)
    .sort((a, b) => score(b) - score(a) || b.sold - a.sold)
    .slice(0, count);
}

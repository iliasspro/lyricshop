export type Collection = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  /** Where the subject sits in the photo, for object-position. */
  focus: string;
  accent: string;
  dark: boolean;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "originals",
    title: "Lyricshop Originals",
    tagline: "Loud hearted, always.",
    description:
      "The house line: heavyweight blanks and the lines we keep coming back to. Built to be worn until the print cracks in all the right places.",
    image: "/images/campaign-rooftop.jpg",
    focus: "70% 40%",
    accent: "#FF4A1C",
    dark: true,
  },
  {
    slug: "night-shift",
    title: "Night Shift",
    tagline: "Neon, rain and 3 a.m. voice memos.",
    description:
      "Red ink on black cloth. Pieces for the ones still awake: producers, poets and everybody walking home with headphones in.",
    image: "/images/collection-night-shift.jpg",
    focus: "50% 30%",
    accent: "#FF4A1C",
    dark: true,
  },
  {
    slug: "paper-hearts",
    title: "Paper Hearts",
    tagline: "Handwritten, soft and slow.",
    description:
      "Cream fleece, ink-pen scripts and the lines you'd only write in a notebook. Made with songwriters who'd rather whisper than shout.",
    image: "/images/collection-paper-hearts.jpg",
    focus: "50% 45%",
    accent: "#C9A227",
    dark: false,
  },
  {
    slug: "basement-tapes",
    title: "Basement Tapes",
    tagline: "One more take. Then one more.",
    description:
      "Distressed screen prints, faded charcoal and the raw energy of a band that rehearses under the stairs.",
    image: "/images/collection-basement-tapes.jpg",
    focus: "50% 35%",
    accent: "#F5D547",
    dark: true,
  },
];

export const COLLECTION_BY_SLUG: Record<string, Collection> = Object.fromEntries(
  COLLECTIONS.map((c) => [c.slug, c]),
);

// Demo marketplace sellers. Portraits were generated with Nano Banana Pro in Google Flow.
// Replace with real artist profiles before launch.

export type Creator = {
  handle: string;
  name: string;
  role: string;
  genre: string;
  location: string;
  avatar: string | null;
  bio: string;
  quote: string;
  followers: number;
  joined: string;
  verified: boolean;
  accent: string;
  links: { label: string; href: string }[];
};

export const CREATORS: Creator[] = [
  {
    handle: "lyricshop",
    name: "Lyricshop Originals",
    role: "In-house studio",
    genre: "Core collection",
    location: "Lyricshop Studio",
    avatar: null,
    bio: "The house line. Heavyweight blanks, honest prints and the lines we keep coming back to. Every Originals piece funds the artist grant we run each season.",
    quote: "Every lyric started as someone talking to themselves.",
    followers: 48210,
    joined: "2026",
    verified: true,
    accent: "#FF4A1C",
    links: [],
  },
  {
    handle: "mayaokafor",
    name: "Maya Okafor",
    role: "Singer-songwriter",
    genre: "Neo-soul",
    location: "Atlanta, GA",
    avatar: "/images/creators/maya-okafor.jpg",
    bio: "Maya writes in voice memos first and notebooks second. Her pieces are soft, handwritten and meant to be worn on the days you need reminding.",
    quote: "If you can hum it back, it's already yours.",
    followers: 12840,
    joined: "2026",
    verified: true,
    accent: "#C9A227",
    links: [{ label: "Listen", href: "#" }],
  },
  {
    handle: "rumi.loops",
    name: "Rumi Sato",
    role: "Producer",
    genre: "Electronic",
    location: "Los Angeles, CA",
    avatar: "/images/creators/rumi-sato.jpg",
    bio: "Bedroom producer, modular-synth hoarder, night-shift worker. Rumi's drops glow a little: neon reds, static, and lines lifted from 3 a.m. session notes.",
    quote: "The good part is always eight bars long. Loop it.",
    followers: 9312,
    joined: "2026",
    verified: true,
    accent: "#FF9EC4",
    links: [{ label: "Listen", href: "#" }],
  },
  {
    handle: "devraman",
    name: "Dev Raman",
    role: "Rapper & poet",
    genre: "Hip-hop / spoken word",
    location: "London, UK",
    avatar: "/images/creators/dev-raman.jpg",
    bio: "Dev carries the same battered notebook to every open mic. His prints are built like verses: blunt on the front, the punchline on the back.",
    quote: "Write it in the margins. That's where the truth fits.",
    followers: 15520,
    joined: "2026",
    verified: true,
    accent: "#6CA6FF",
    links: [{ label: "Listen", href: "#" }],
  },
  {
    handle: "kaimoreno",
    name: "Kai Moreno",
    role: "Guitarist & songwriter",
    genre: "Punk",
    location: "Albuquerque, NM",
    avatar: "/images/creators/kai-moreno.jpg",
    bio: "Three chords, one more take. Kai's basement-recorded band sells out every pressing of their tapes, and now their merch is all yours. Loud, distressed and proudly off-key.",
    quote: "Off-key and on purpose.",
    followers: 7904,
    joined: "2026",
    verified: false,
    accent: "#F5D547",
    links: [{ label: "Listen", href: "#" }],
  },
  {
    handle: "junebug",
    name: "June Abernathy",
    role: "Folk songwriter",
    genre: "Folk / Americana",
    location: "Asheville, NC",
    avatar: "/images/creators/june-abernathy.jpg",
    bio: "Forty years of porch songs. June writes slow, warm lines about kitchens, weather and the people who stay. Her pieces are cut in sand, sage and sunlight.",
    quote: "Leave the porch light on. Somebody's still singing.",
    followers: 6120,
    joined: "2026",
    verified: true,
    accent: "#A3AE95",
    links: [{ label: "Listen", href: "#" }],
  },
  {
    handle: "nourafterdark",
    name: "Nour Haddad",
    role: "Jazz vocalist",
    genre: "Jazz",
    location: "Montréal, QC",
    avatar: "/images/creators/nour-haddad.jpg",
    bio: "Nour sings standards in a red-curtained room three nights a week and writes her own on the other four. Velvet colors, gold ink, everything in a minor key.",
    quote: "After midnight, every song is in a minor key.",
    followers: 10455,
    joined: "2026",
    verified: true,
    accent: "#B9A7FF",
    links: [{ label: "Listen", href: "#" }],
  },
];

export const CREATOR_BY_HANDLE: Record<string, Creator> = Object.fromEntries(CREATORS.map((c) => [c.handle, c]));

export function getCreator(handle: string): Creator | undefined {
  return CREATOR_BY_HANDLE[handle];
}

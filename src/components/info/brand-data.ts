// Brand palette shared by the brand page (server) and the copy-to-clipboard swatches (client).

export type BrandColor = {
  name: string;
  hex: string;
  token: string;
  role: string;
  note: string;
  dark: boolean;
};

export const BRAND_PALETTE: BrandColor[] = [
  {
    name: "Ink",
    hex: "#0F0E0D",
    token: "--color-ink",
    role: "Primary",
    note: "Type, the logo and our night sections. A warm, smoky black. Never #000.",
    dark: true,
  },
  {
    name: "Bone",
    hex: "#F3EEE5",
    token: "--color-bone",
    role: "Primary",
    note: "The page. Unbleached and warm, like the inside of a record sleeve.",
    dark: false,
  },
  {
    name: "On-Air Red",
    hex: "#FF4A1C",
    token: "--color-red",
    role: "Accent",
    note: "The one light in the room: records, dots, the word that matters. Once per view. On screen the token runs a touch deeper (#F4441B) so red words hold 3:1 on bone.",
    dark: false,
  },
  {
    name: "Paper",
    hex: "#EAE3D7",
    token: "--color-paper",
    role: "Surface",
    note: "Cards and quiet sections, one step down from bone.",
    dark: false,
  },
  {
    name: "Sand",
    hex: "#D9D0C1",
    token: "--color-sand",
    role: "Surface",
    note: "Borders, dividers, empty states.",
    dark: false,
  },
  {
    name: "Smoke",
    hex: "#6B645D",
    token: "--color-smoke",
    role: "Text",
    note: "Secondary text and captions. Passes AA on bone and paper.",
    dark: true,
  },
  {
    name: "Tape",
    hex: "#F5D547",
    token: "--color-tape",
    role: "Highlight",
    note: "Masking-tape yellow for highlights and limited runs. Rarely.",
    dark: false,
  },
];

export const BRAND_HEX = Object.fromEntries(BRAND_PALETTE.map((c) => [c.name, c.hex])) as Record<string, string>;

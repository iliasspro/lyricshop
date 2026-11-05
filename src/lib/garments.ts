// Vector garment blanks. Every view lives in a 1000×1000 box so mockups line up.
// Shapes are drawn in order: under → body → inner → trims → over → (print) → shading.

export type GarmentId = "tee" | "longsleeve" | "hoodie" | "crewneck" | "tote" | "cap";
export type GarmentView = "front" | "back";

export type PrintArea = { x: number; y: number; w: number; h: number };

export type Fold = { d: string; tone: "dark" | "light"; width: number; opacity: number };

export type GarmentShape = {
  /** Drawn first, slightly darker (e.g. the back of a hood). */
  under?: string[];
  body: string;
  /** Inside of the garment seen through openings. */
  inner?: string[];
  /** Ribbed trims: collars, cuffs, waistbands. */
  trims?: string[];
  /** Panels sewn on top of the body (pockets, hoods, brims). */
  over?: string[];
  /** Inside surfaces drawn above `over` (the hood lining). */
  lining?: string[];
  seams?: string[];
  stitches?: string[];
  cords?: { d: string; end: [number, number] }[];
  /** Thick canvas straps (tote handles); `back` ones sit behind the body. */
  straps?: { d: string; back?: boolean }[];
  eyelets?: [number, number][];
  button?: { cx: number; cy: number; r: number };
  folds?: Fold[];
  label?: { x: number; y: number; w: number; h: number };
  shadow: { cx: number; cy: number; rx: number; ry: number };
  printArea: PrintArea;
};

export type Garment = {
  id: GarmentId;
  name: string;
  short: string;
  basePrice: number;
  fabric: string;
  fit: string;
  sizes: string[];
  colors: string[];
  /** Mockup framing; defaults to the full 1000×1000 box. */
  viewBox?: string;
  views: Partial<Record<GarmentView, GarmentShape>>;
};

const mirrorX = (d: string) =>
  // Mirrors absolute path data around x=500 (only numbers in x positions change).
  d.replace(/([MLCQTSA])([^MLCQTSAZ]*)/g, (_, cmd: string, args: string) => {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    const out = nums.map((n, i) => (i % 2 === 0 ? 1000 - n : n));
    return cmd + out.join(" ");
  });

const pair = (d: string) => [d, mirrorX(d)];

// ---------------------------------------------------------------------------
// T-shirt
// ---------------------------------------------------------------------------
const TEE_BODY =
  "M400 95Q500 74 600 95L762 134C812 150 868 212 906 328L797 414L738 350C742 520 748 760 746 938Q500 954 254 938C252 760 258 520 262 350L203 414L94 328C132 212 188 150 238 134Z";

const TEE_COMMON = {
  seams: [...pair("M400 95L238 134"), ...pair("M238 134C252 200 262 280 262 350")],
  stitches: [...pair("M110 314L214 396"), "M256 919Q500 935 744 919"],
  shadow: { cx: 500, cy: 962, rx: 330, ry: 20 },
};

const TEE_FOLDS: Fold[] = [
  ...pair("M272 382C300 424 318 470 328 528").map((d) => ({ d, tone: "dark" as const, width: 26, opacity: 0.12 })),
  ...pair("M152 292C182 302 212 324 232 352").map((d) => ({ d, tone: "dark" as const, width: 14, opacity: 0.1 })),
  { d: "M300 806Q380 836 452 824", tone: "dark", width: 30, opacity: 0.08 },
  { d: "M560 842Q640 832 702 792", tone: "dark", width: 30, opacity: 0.08 },
  { d: "M432 250C420 400 430 560 442 700", tone: "light", width: 64, opacity: 0.06 },
  { d: "M640 300C650 420 652 540 640 660", tone: "light", width: 40, opacity: 0.04 },
];

const tee: Garment = {
  id: "tee",
  name: "Heavyweight Boxy Tee",
  short: "Tee",
  basePrice: 34,
  fabric: "240 gsm organic cotton jersey, garment dyed",
  fit: "Boxy, slightly cropped. Size down for a regular fit.",
  sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  colors: ["black", "bone", "white", "red", "charcoal", "heather", "sand", "sage", "navy", "burgundy", "lilac", "forest"],
  views: {
    front: {
      body: TEE_BODY,
      inner: ["M400 95Q500 74 600 95C588 126 552 150 500 150C448 150 412 126 400 95Z"],
      trims: [
        "M400 95C412 126 448 150 500 150C552 150 588 126 600 95L620 100C604 146 558 174 500 174C442 174 396 146 380 100Z",
        "M404 97Q500 76 596 97L591 110Q500 90 409 110Z",
      ],
      label: { x: 485, y: 92, w: 30, h: 13 },
      folds: [
        ...TEE_FOLDS,
        { d: "M412 122C442 172 558 172 588 122", tone: "dark", width: 18, opacity: 0.14 },
      ],
      printArea: { x: 345, y: 215, w: 310, h: 400 },
      ...TEE_COMMON,
    },
    back: {
      body: "M400 95Q500 80 600 95L762 134C812 150 868 212 906 328L797 414L738 350C742 520 748 760 746 938Q500 954 254 938C252 760 258 520 262 350L203 414L94 328C132 212 188 150 238 134Z",
      trims: ["M400 95Q500 80 600 95L614 105Q500 92 386 105Z"],
      folds: [...TEE_FOLDS, { d: "M402 130Q500 118 598 130", tone: "dark", width: 14, opacity: 0.08 }],
      printArea: { x: 320, y: 190, w: 360, h: 480 },
      ...TEE_COMMON,
    },
  },
};

// ---------------------------------------------------------------------------
// Long sleeve
// ---------------------------------------------------------------------------
const LS_BODY = (top: string) =>
  `M400 95${top}L762 134C818 150 864 214 878 300L934 852L832 868L738 350C742 520 748 760 746 938Q500 954 254 938C252 760 258 520 262 350L168 868L66 852L122 300C136 214 182 150 238 134Z`;

const LS_FOLDS: Fold[] = [
  ...pair("M272 382C300 424 318 470 328 528").map((d) => ({ d, tone: "dark" as const, width: 24, opacity: 0.11 })),
  ...pair("M108 560Q140 576 182 570").map((d) => ({ d, tone: "dark" as const, width: 16, opacity: 0.1 })),
  ...pair("M96 700Q132 720 174 712").map((d) => ({ d, tone: "dark" as const, width: 14, opacity: 0.08 })),
  ...pair("M134 420C126 520 114 640 104 780").map((d) => ({ d, tone: "light" as const, width: 26, opacity: 0.07 })),
  { d: "M432 250C420 400 430 560 442 700", tone: "light", width: 64, opacity: 0.09 },
  { d: "M300 806Q380 836 452 824", tone: "dark", width: 30, opacity: 0.08 },
];

const LS_COMMON = {
  seams: [...pair("M400 95L238 134"), ...pair("M238 134C252 200 262 280 262 350")],
  stitches: ["M256 919Q500 935 744 919"],
  shadow: { cx: 500, cy: 962, rx: 360, ry: 20 },
};
const LS_CUFFS = pair("M66 852L168 868L164 922L70 909Z");

const longsleeve: Garment = {
  id: "longsleeve",
  name: "Heavyweight Long Sleeve",
  short: "Long Sleeve",
  basePrice: 44,
  fabric: "240 gsm organic cotton jersey with rib cuffs",
  fit: "Relaxed fit with dropped shoulders.",
  sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  colors: ["black", "bone", "white", "charcoal", "heather", "navy", "burgundy", "forest", "sand"],
  views: {
    front: {
      body: LS_BODY("Q500 74 600 95"),
      inner: ["M400 95Q500 74 600 95C588 126 552 150 500 150C448 150 412 126 400 95Z"],
      trims: [
        "M400 95C412 126 448 150 500 150C552 150 588 126 600 95L620 100C604 146 558 174 500 174C442 174 396 146 380 100Z",
        "M404 97Q500 76 596 97L591 110Q500 90 409 110Z",
        ...LS_CUFFS,
      ],
      label: { x: 485, y: 92, w: 30, h: 13 },
      folds: [...LS_FOLDS, { d: "M412 122C442 172 558 172 588 122", tone: "dark", width: 18, opacity: 0.14 }],
      printArea: { x: 345, y: 215, w: 310, h: 400 },
      ...LS_COMMON,
    },
    back: {
      body: LS_BODY("Q500 80 600 95"),
      trims: ["M400 95Q500 80 600 95L614 105Q500 92 386 105Z", ...LS_CUFFS],
      folds: LS_FOLDS,
      printArea: { x: 320, y: 190, w: 360, h: 480 },
      ...LS_COMMON,
    },
  },
};

// ---------------------------------------------------------------------------
// Hoodie
// ---------------------------------------------------------------------------
const HOODIE_BODY =
  "M335 178L205 220C158 236 138 290 130 360L86 842L182 858L250 410C256 560 262 760 264 872L736 872C738 760 744 560 750 410L818 858L914 842L870 360C862 290 842 236 795 220L665 178Z";
const HOODIE_TRIMS = [
  "M264 872L736 872L730 950L270 950Z",
  ...pair("M86 842L182 858L178 918L90 905Z"),
];
const HOODIE_FOLDS: Fold[] = [
  ...pair("M262 432C292 472 312 522 318 582").map((d) => ({ d, tone: "dark" as const, width: 28, opacity: 0.12 })),
  ...pair("M114 560Q152 580 196 570").map((d) => ({ d, tone: "dark" as const, width: 18, opacity: 0.1 })),
  ...pair("M102 690Q140 712 186 702").map((d) => ({ d, tone: "dark" as const, width: 16, opacity: 0.08 })),
  ...pair("M146 400C136 520 124 640 112 790").map((d) => ({ d, tone: "light" as const, width: 30, opacity: 0.07 })),
  { d: "M420 330C410 480 420 600 430 640", tone: "light", width: 72, opacity: 0.05 },
  { d: "M300 840Q400 860 470 850", tone: "dark", width: 24, opacity: 0.08 },
];

const hoodie: Garment = {
  id: "hoodie",
  name: "Heavyweight Pullover Hoodie",
  short: "Hoodie",
  basePrice: 64,
  fabric: "450 gsm brushed-back organic cotton fleece",
  fit: "Oversized with dropped shoulders and a double-layer hood.",
  sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  colors: ["black", "bone", "red", "charcoal", "heather", "sand", "sage", "forest", "navy", "burgundy", "lilac", "olive"],
  views: {
    front: {
      under: ["M318 196C292 104 360 30 500 26C640 30 708 104 682 196Z"],
      body: HOODIE_BODY,
      trims: HOODIE_TRIMS,
      over: [
        "M344 168C338 76 410 34 500 34C590 34 662 76 656 168C634 236 566 280 500 304C434 280 366 236 344 168Z",
        "M348 648L652 648C676 698 690 748 698 792L700 872L300 872L302 792C310 748 324 698 348 648Z",
      ],
      lining: ["M372 150C376 84 428 52 500 52C572 52 624 84 628 150C606 204 552 246 500 270C448 246 394 204 372 150Z"],
      seams: [
        ...pair("M205 220C225 290 240 350 250 410"),
        "M348 648C324 698 310 748 302 792L300 872",
        "M652 648C676 698 690 748 698 792L700 872",
        "M500 270L500 304",
        "M470 250Q500 272 528 298",
      ],
      stitches: ["M352 662L648 662", "M362 172C366 98 424 64 500 64C576 64 634 98 638 172"],
      eyelets: [
        [462, 262],
        [538, 262],
      ],
      cords: [
        { d: "M462 262C459 310 455 360 452 404", end: [452, 404] },
        { d: "M538 262C542 306 545 350 548 392", end: [548, 392] },
      ],
      folds: [
        ...HOODIE_FOLDS,
        { d: "M370 306C430 334 570 334 630 306", tone: "dark", width: 22, opacity: 0.07 },
        { d: "M352 656L648 656", tone: "dark", width: 10, opacity: 0.12 },
      ],
      printArea: { x: 360, y: 344, w: 280, h: 290 },
      shadow: { cx: 500, cy: 970, rx: 360, ry: 20 },
    },
    back: {
      body: HOODIE_BODY,
      trims: HOODIE_TRIMS,
      over: ["M318 196C292 104 360 30 500 26C640 30 708 104 682 196C664 262 590 312 500 318C410 312 336 262 318 196Z"],
      seams: [...pair("M205 220C225 290 240 350 250 410"), "M500 28L500 316"],
      stitches: ["M330 204C350 262 418 300 500 304C582 300 650 262 670 204"],
      folds: [
        ...HOODIE_FOLDS,
        { d: "M340 262C400 340 600 340 660 262", tone: "dark", width: 34, opacity: 0.12 },
        { d: "M420 70C400 140 410 220 440 280", tone: "light", width: 40, opacity: 0.07 },
      ],
      printArea: { x: 320, y: 350, w: 360, h: 470 },
      shadow: { cx: 500, cy: 970, rx: 360, ry: 20 },
    },
  },
};

// ---------------------------------------------------------------------------
// Crewneck sweatshirt
// ---------------------------------------------------------------------------
const CREW_BODY = (top: string) =>
  `M405 118${top}L795 210C842 228 862 284 870 356L914 842L818 858L750 410C744 560 738 760 736 872L264 872C262 760 256 560 250 410L182 858L86 842L130 356C138 284 158 228 205 210Z`;
const CREW_SEAMS = [...pair("M405 118L205 210"), ...pair("M205 210C228 285 242 350 250 410")];

const crewneck: Garment = {
  id: "crewneck",
  name: "Heavyweight Crewneck",
  short: "Crewneck",
  basePrice: 58,
  fabric: "420 gsm brushed-back organic cotton fleece",
  fit: "Relaxed, boxy fit with heavy rib trims.",
  sizes: ["XS", "S", "M", "L", "XL", "2XL"],
  colors: ["black", "bone", "heather", "charcoal", "sand", "sage", "navy", "burgundy", "forest", "red"],
  views: {
    front: {
      body: CREW_BODY("Q500 98 595 118"),
      inner: ["M405 118Q500 98 595 118C584 152 548 176 500 176C452 176 416 152 405 118Z"],
      trims: [
        "M405 118C416 152 452 176 500 176C548 176 584 152 595 118L622 124C608 176 560 206 500 206C440 206 392 176 378 124Z",
        "M409 120Q500 101 591 120L585 133Q500 115 415 133Z",
        ...HOODIE_TRIMS,
      ],
      seams: CREW_SEAMS,
      label: { x: 485, y: 115, w: 30, h: 13 },
      folds: [...HOODIE_FOLDS, { d: "M396 150C440 214 560 214 604 150", tone: "dark", width: 20, opacity: 0.14 }],
      printArea: { x: 345, y: 250, w: 310, h: 400 },
      shadow: { cx: 500, cy: 970, rx: 360, ry: 20 },
    },
    back: {
      body: CREW_BODY("Q500 106 595 118"),
      trims: ["M405 118Q500 106 595 118L612 129Q500 118 388 129Z", ...HOODIE_TRIMS],
      seams: CREW_SEAMS,
      folds: HOODIE_FOLDS,
      printArea: { x: 320, y: 230, w: 360, h: 500 },
      shadow: { cx: 500, cy: 970, rx: 360, ry: 20 },
    },
  },
};

// ---------------------------------------------------------------------------
// Tote bag
// ---------------------------------------------------------------------------
const tote: Garment = {
  id: "tote",
  name: "Heavy Canvas Tote",
  short: "Tote",
  basePrice: 26,
  fabric: "16 oz organic cotton canvas, reinforced handles",
  fit: "15 × 16 in body, 25 in handle drop.",
  sizes: ["One size"],
  colors: ["natural", "black", "bone", "red", "navy", "forest"],
  views: {
    front: {
      body: "M225 330L775 330L798 948L202 948Z",
      trims: ["M225 330L775 330L777 372L223 372Z"],
      straps: [
        { d: "M382 336C382 170 430 118 500 118C570 118 618 170 618 336", back: true },
        { d: "M352 420L352 332C352 140 418 84 500 84C582 84 648 140 648 332L648 420" },
      ],
      stitches: ["M224 360L776 360", "M210 930L790 930"],
      folds: [
        { d: "M300 380C296 560 290 760 286 930", tone: "light", width: 46, opacity: 0.08 },
        { d: "M640 400C660 560 690 760 700 930", tone: "dark", width: 36, opacity: 0.08 },
        { d: "M480 380C486 520 476 700 470 930", tone: "dark", width: 18, opacity: 0.05 },
        { d: "M230 900Q500 940 780 900", tone: "dark", width: 30, opacity: 0.08 },
      ],
      printArea: { x: 290, y: 440, w: 420, h: 430 },
      shadow: { cx: 500, cy: 966, rx: 320, ry: 18 },
    },
  },
};

// ---------------------------------------------------------------------------
// Cap
// ---------------------------------------------------------------------------
const cap: Garment = {
  id: "cap",
  name: "Washed 5-Panel Cap",
  short: "Cap",
  basePrice: 30,
  fabric: "Washed cotton twill, adjustable brass clasp",
  fit: "Unstructured crown, one size fits most.",
  sizes: ["One size"],
  colors: ["black", "bone", "red", "navy", "olive", "forest", "sand", "burgundy"],
  viewBox: "130 160 740 740",
  views: {
    front: {
      body: "M232 612C232 404 352 300 500 296C648 300 768 404 768 612Z",
      over: ["M222 606C330 584 670 584 778 606C790 650 742 712 500 724C258 712 210 650 222 606Z"],
      seams: [
        "M500 300C442 360 410 470 402 610",
        "M500 300C558 360 590 470 598 610",
        "M500 300C392 340 316 440 290 596",
        "M500 300C608 340 684 440 710 596",
        "M232 612L768 612",
        "M232 690C330 716 670 716 768 690",
      ],
      stitches: [
        "M240 622C340 604 660 604 760 622",
        "M248 646C350 630 650 630 752 646",
        "M412 600L412 380",
        "M588 600L588 380",
      ],
      eyelets: [
        [334, 430],
        [666, 430],
      ],
      button: { cx: 500, cy: 298, r: 15 },
      folds: [
        { d: "M440 340C424 420 424 500 440 580", tone: "light", width: 60, opacity: 0.12 },
        { d: "M262 470C270 520 276 560 282 600", tone: "dark", width: 44, opacity: 0.12 },
        { d: "M738 470C730 520 724 560 718 600", tone: "dark", width: 44, opacity: 0.12 },
        { d: "M236 610C330 590 670 590 764 610", tone: "dark", width: 14, opacity: 0.24 },
        { d: "M300 690C420 712 580 712 700 690", tone: "dark", width: 24, opacity: 0.14 },
        { d: "M360 640C440 650 560 650 640 640", tone: "light", width: 30, opacity: 0.08 },
      ],
      printArea: { x: 405, y: 402, w: 190, h: 170 },
      shadow: { cx: 500, cy: 742, rx: 290, ry: 16 },
    },
  },
};

export const GARMENTS: Record<GarmentId, Garment> = { tee, longsleeve, hoodie, crewneck, tote, cap };
export const GARMENT_LIST: Garment[] = [hoodie, tee, crewneck, longsleeve, tote, cap];

export const BACK_PRINT_PRICE = 8;

export function viewsFor(id: GarmentId): GarmentView[] {
  return (Object.keys(GARMENTS[id].views) as GarmentView[]).filter((v) => GARMENTS[id].views[v]);
}

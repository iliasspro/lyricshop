// Chart tokens for the demo dashboard: the brand palette run through the dataviz skill's
// validator (scripts/validate_palette.js) against the surfaces the charts actually sit on.
//
//   series  #FF4A1C  OKLCH band + chroma PASS in light and dark;
//                    contrast 3.20:1 on the light tile, 5.73:1 on the ink card.
//                    (2.91:1 on bone, so chart marks never sit directly on the page background.)
//   muted   #8C857B  de-emphasis line (previous period), 3.47:1 on the light tile.
//   good    #2F7D4F  delta text, 4.80:1 on the light tile (WCAG text contrast).
//   bad     #C2330E  delta text, 5.30:1 on the light tile.

export const VIZ = {
  /** Light chart surface (tiles, tables). */
  tile: "#FBF9F6",
  /** Dark chart surface (the daily revenue card). */
  ink: "#0F0E0D",
  series: "#FF4A1C",
  muted: "#8C857B",
} as const;

/** Card chrome for every light dashboard surface. Keep in sync with VIZ.tile. */
export const TILE = "rounded-[24px] bg-[#fbf9f6] ring-1 ring-ink/8";

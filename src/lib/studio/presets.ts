import { graphic, layerId, text, type Layer } from "../design";
import { fitLyric } from "../fit";

export type Preset = {
  id: string;
  name: string;
  hint: string;
  build: (line: string, ink: string, accent: string, aspect: number) => Layer[];
};

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);

export const PRESETS: Preset[] = [
  {
    id: "stack",
    name: "Stack",
    hint: "Loud condensed caps",
    build: (line, ink, _a, aspect) => {
      const f = fitLyric(line, "anton", { aspect, uppercase: true, lineHeight: 0.88, maxSize: 0.36 });
      return [text({ id: layerId("t"), text: f.text, font: "anton", size: f.size, uppercase: true, lineHeight: 0.88, color: ink, y: 0.42 })];
    },
  },
  {
    id: "arch",
    name: "Arch",
    hint: "Varsity curve",
    build: (line, ink, accent, aspect) => {
      const f = fitLyric(line, "abril-fatface", { aspect, maxSize: 0.2 });
      return [
        text({ id: layerId("t"), text: line.trim(), font: "abril-fatface", size: Math.min(0.2, f.size * 1.1), curve: 42, color: accent, y: 0.36 }),
        graphic({ id: layerId("g"), graphic: "star", size: 0.08, color: ink, y: 0.6 }),
      ];
    },
  },
  {
    id: "whisper",
    name: "Whisper & shout",
    hint: "Serif lead-in, loud ending",
    build: (line, ink, accent, aspect) => {
      const w = words(line);
      const cut = Math.max(1, Math.ceil(w.length / 2));
      const soft = w.slice(0, cut).join(" ") || line;
      const loud = w.slice(cut).join(" ") || line;
      const a = fitLyric(soft, "instrument-serif-italic", { aspect: aspect * 0.35, maxSize: 0.13 });
      const b = fitLyric(loud, "anton", { aspect: aspect * 0.6, uppercase: true, maxSize: 0.3, lineHeight: 0.88 });
      // stack the two blocks with a small gap, centred vertically (heights in print-height units)
      const ha = (a.text.split("\n").length * a.size * 1.0) / aspect;
      const hb = (b.text.split("\n").length * b.size * 0.88) / aspect;
      const gap = 0.03;
      const top = 0.45 - (ha + gap + hb) / 2;
      return [
        text({ id: layerId("t"), text: a.text, font: "instrument-serif-italic", size: a.size, color: ink, y: top + ha / 2 }),
        text({ id: layerId("t"), text: b.text, font: "anton", size: b.size, uppercase: true, lineHeight: 0.88, color: accent, y: top + ha + gap + hb / 2 }),
      ];
    },
  },
  {
    id: "echo",
    name: "Echo",
    hint: "Repeats and fades",
    build: (line, ink) => {
      const f = fitLyric(line, "bebas-neue", { aspect: 0.2, uppercase: true, maxSize: 0.2 });
      const single = f.text.replace(/\n/g, " ");
      return [0, 1, 2, 3, 4].map((i) =>
        text({
          id: layerId("t"),
          text: single,
          font: "bebas-neue",
          size: Math.min(0.2, f.size),
          uppercase: true,
          color: ink,
          y: 0.14 + i * 0.16,
          opacity: [1, 0.7, 0.45, 0.26, 0.12][i],
        }),
      );
    },
  },
  {
    id: "sticker",
    name: "Sticker",
    hint: "Starburst badge",
    build: (line, _ink, accent) => {
      const f = fitLyric(line, "archivo-black", { aspect: 1, uppercase: true, maxSize: 0.12, lineHeight: 0.95 });
      return [
        graphic({ id: layerId("g"), graphic: "burst", size: 0.72, color: accent, y: 0.42, rotation: -8 }),
        text({ id: layerId("t"), text: f.text, font: "archivo-black", size: Math.min(0.12, f.size * 0.62), uppercase: true, color: "#0F0E0D", y: 0.42, rotation: -8, lineHeight: 0.95 }),
      ];
    },
  },
  {
    id: "liner",
    name: "Liner notes",
    hint: "Typewritten, small",
    build: (line, ink) => {
      const f = fitLyric(line, "special-elite", { aspect: 1.6, maxSize: 0.07 });
      return [
        text({ id: layerId("t"), text: "track 01 —", font: "special-elite", size: 0.045, color: ink, y: 0.08, x: 0.5, opacity: 0.7 }),
        text({ id: layerId("t"), text: f.text, font: "special-elite", size: f.size, color: ink, y: 0.18, lineHeight: 1.45 }),
      ];
    },
  },
  {
    id: "record",
    name: "Record",
    hint: "Vinyl with curved title",
    build: (line, ink, accent) => [
      text({ id: layerId("t"), text: line.trim().toUpperCase(), font: "bebas-neue", size: 0.12, curve: 55, color: ink, y: 0.2, letterSpacing: 0.06 }),
      graphic({ id: layerId("g"), graphic: "vinyl", size: 0.56, color: accent, y: 0.58 }),
    ],
  },
  {
    id: "script",
    name: "Love letter",
    hint: "Script with a heart",
    build: (line, ink, accent, aspect) => {
      const f = fitLyric(line, "yellowtail", { aspect, maxSize: 0.2 });
      return [
        text({ id: layerId("t"), text: f.text, font: "yellowtail", size: f.size, color: ink, y: 0.4, rotation: -5 }),
        graphic({ id: layerId("g"), graphic: "heart", size: 0.09, color: accent, x: 0.84, y: 0.2, rotation: 14 }),
      ];
    },
  },
];

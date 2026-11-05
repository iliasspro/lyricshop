import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lyricshop — Wear your words",
    short_name: "Lyricshop",
    description: "Lyric-driven streetwear from independent artists, plus a studio to design your own.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F3EEE5",
    theme_color: "#0F0E0D",
    categories: ["shopping", "lifestyle", "music"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}

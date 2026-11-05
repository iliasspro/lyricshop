import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/data/collections";
import { CREATORS } from "@/lib/data/creators";
import { PRODUCTS } from "@/lib/data/products";
import { SITE_URL } from "@/lib/site";

const url = (path: string) => `${SITE_URL}${path}`;

type Entry = MetadataRoute.Sitemap[number];

// No lastModified: the catalog has no real edit dates yet, and a guessed date is worse than none.
// (A timestamp from new Date() would also stop this route from being prerendered.)
const STATIC: { path: string; changeFrequency: Entry["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.8 },
  { path: "/artists", changeFrequency: "weekly", priority: 0.8 },
  { path: "/studio", changeFrequency: "monthly", priority: 0.8 },
  { path: "/sell", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/help", changeFrequency: "monthly", priority: 0.4 },
  { path: "/brand", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = STATIC.map(({ path, changeFrequency, priority }) => ({
    url: url(path),
    changeFrequency,
    priority,
  }));

  const collections: MetadataRoute.Sitemap = COLLECTIONS.map((c) => ({
    url: url(`/collections/${c.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
    images: [url(c.image)],
  }));

  const artists: MetadataRoute.Sitemap = CREATORS.map((a) => ({
    url: url(`/artists/${a.handle}`),
    changeFrequency: "weekly",
    priority: 0.6,
    ...(a.avatar ? { images: [url(a.avatar)] } : {}),
  }));

  const products: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: url(`/product/${p.slug}`),
    changeFrequency: "weekly",
    priority: 0.8,
    ...(p.lifestyle ? { images: [url(p.lifestyle)] } : {}),
  }));

  return [...pages, ...collections, ...artists, ...products];
}

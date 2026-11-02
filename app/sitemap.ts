import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { getSiteUrl } from "@/lib/seo/site-url";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * /sitemap.xml — static marketing routes plus every dynamic content route
 * enumerated from the content adapter (works for json-source today and a
 * future payload-source with no change here). Entries carry a representative
 * image so the sitemap doubles as an image sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const lastModified = new Date();
  // Promote an asset key to an absolute URL (sitemap images must be absolute).
  const abs = (key: string): string => new URL(assetUrl(key), base).toString();
  const bannerImage = abs("banner/banner.png");

  const staticRoutes: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/characters", priority: 0.8 },
    { path: "/shop", priority: 0.8 },
    { path: "/watch", priority: 0.8 },
    { path: "/top-picks", priority: 0.7 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
    images: [bannerImage],
  }));

  const [characters, comingSoon] = await Promise.all([
    content.getCharacters(),
    content.getComingSoonPages(),
  ]);

  const characterEntries: MetadataRoute.Sitemap = characters.map((c) => ({
    url: `${base}/characters/${c.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
    images: [abs(c.image)],
  }));

  const comingSoonEntries: MetadataRoute.Sitemap = comingSoon.map((p) => ({
    url: `${base}/coming-soon/${p.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticEntries, ...characterEntries, ...comingSoonEntries];
}

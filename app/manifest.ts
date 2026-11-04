import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { getSiteUrl } from "@/lib/seo/site-url";
import { assetUrl } from "@/lib/utils/asset-url";

const APP_ICON_KEY = "brand/icons/app-icon-512.png";

/**
 * /manifest.webmanifest — minimal PWA manifest for "add to home screen".
 * Name/colors come from the site config + palette so branding stays in one
 * place. The icon is a square PNG export of Buddy's avatar (see
 * `scripts/export-brand-art.sh`); its URL is forced absolute against the site
 * origin so it stays valid even if the R2 CDN env is unset.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await content.getSiteConfig();
  const iconUrl = new URL(assetUrl(APP_ICON_KEY), getSiteUrl()).toString();
  return {
    name: config.brand.fullName,
    short_name: config.brand.name,
    description: config.brand.description,
    start_url: "/",
    display: "standalone",
    background_color: config.palette.backgroundCream,
    theme_color: config.palette.brandPrimary,
    icons: [
      {
        src: iconUrl,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

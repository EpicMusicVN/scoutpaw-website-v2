import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Shared Open Graph image metadata. Declaring real pixel dimensions lets
 * crawlers render the share card without a pre-fetch. The default banner is
 * measured from `public/assets/banner/banner.png` (2754×1536). Centralized so
 * width/height never drift across pages (DRY).
 */
const BANNER_KEY = "banner/banner.png";
const BANNER_WIDTH = 2754;
const BANNER_HEIGHT = 1536;

export function bannerOgImage(alt: string): {
  url: string;
  width: number;
  height: number;
  alt: string;
} {
  return { url: assetUrl(BANNER_KEY), width: BANNER_WIDTH, height: BANNER_HEIGHT, alt };
}

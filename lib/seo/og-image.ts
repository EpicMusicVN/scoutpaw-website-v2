import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Shared Open Graph image metadata. Declaring real pixel dimensions lets
 * crawlers render the share card without a pre-fetch. The default card is the
 * 2D pack scene with the wordmark, exported at the 1200×630 share size by
 * `scripts/export-brand-art.sh`. Centralized so width/height never drift
 * across pages (DRY).
 */
const BANNER_KEY = "brand/scene/pack-scene-og.jpg";
const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 630;

export function bannerOgImage(alt: string): {
  url: string;
  width: number;
  height: number;
  alt: string;
} {
  return { url: assetUrl(BANNER_KEY), width: BANNER_WIDTH, height: BANNER_HEIGHT, alt };
}

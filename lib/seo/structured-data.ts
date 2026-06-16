import type { FaqItem, SiteConfig, Video } from "@/lib/content";
import type { ShopProduct } from "@/lib/shopify/types";
import { assetUrl } from "@/lib/utils/asset-url";
import type { JsonLdData } from "@/components/seo/json-ld";

/**
 * Pure schema.org builders. Each returns a plain object consumed by <JsonLd>.
 * Content is sourced from the content adapter (SiteConfig etc.) so there are no
 * duplicated brand strings. Entity builders (VideoObject/Product/Breadcrumb/FAQ)
 * are added in later phases alongside these.
 */

const SCHEMA_CONTEXT = "https://schema.org";

/**
 * Resolve an asset key to an absolute URL. `assetUrl` returns a relative
 * `/assets/...` path when the R2 CDN env is unset; schema.org requires
 * absolute image URLs, so promote against the site origin as a safety net.
 */
function absoluteAssetUrl(key: string, siteUrl: string): string {
  return new URL(assetUrl(key), siteUrl).toString();
}

/**
 * Stable `@id`s for the site-wide entities. Cross-block JSON-LD references
 * (VideoObject.publisher, Product.brand, WebSite.publisher) point here — the
 * strings MUST be byte-identical wherever they appear or the graph breaks, so
 * everything routes through these two helpers.
 */
export const orgId = (siteUrl: string): string => `${siteUrl}#organization`;
export const websiteId = (siteUrl: string): string => `${siteUrl}#website`;

/**
 * Convert a display duration ("M:SS" or "H:MM:SS") to ISO 8601 ("PT1H24M18S").
 * Returns undefined on a malformed value so the caller omits the field rather
 * than emit invalid schema.
 */
function isoDuration(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parts = value.split(":").map((p) => Number(p));
  if (parts.length < 2 || parts.length > 3 || parts.some((n) => Number.isNaN(n))) {
    return undefined;
  }
  const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
  const iso = `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
  return iso === "PT" ? "PT0S" : iso;
}

/** Site-wide Organization node — the canonical entity for "ScoutPaw". */
export function organizationSchema(config: SiteConfig, siteUrl: string): JsonLdData {
  const sameAs = config.social.map((s) => s.url).filter((url) => url.length > 0);
  const node: JsonLdData = {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    "@id": orgId(siteUrl),
    name: config.brand.fullName,
    alternateName: config.brand.name,
    slogan: config.brand.tagline,
    url: siteUrl,
    logo: absoluteAssetUrl(config.brand.logo, siteUrl),
    description: config.brand.description,
  };
  if (sameAs.length > 0) node.sameAs = sameAs;
  return node;
}

/**
 * WebSite node. No `potentialAction`/SearchAction — the site has no on-site
 * query-URL search (existing search is client-side filtering only).
 */
export function websiteSchema(config: SiteConfig, siteUrl: string): JsonLdData {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    name: config.brand.fullName,
    url: siteUrl,
    description: config.brand.description,
    inLanguage: "en",
    publisher: { "@id": orgId(siteUrl) },
  };
}

/**
 * VideoObject for a YouTube-backed video. Returns `null` when `uploadDate` is
 * missing (Google requires it) — caller filters nulls rather than emit invalid
 * schema. Thumbnail falls back to the YouTube CDN derived from the video id.
 */
export function videoObjectSchema(video: Video, siteUrl: string): JsonLdData | null {
  if (!video.uploadDate) return null;
  // schema.org requires an absolute thumbnailUrl. `absoluteAssetUrl` promotes a
  // relative asset key against the origin, and passes an already-absolute value
  // (e.g. an enriched i.ytimg.com URL) through untouched.
  const thumbnailUrl = video.thumbnail
    ? absoluteAssetUrl(video.thumbnail, siteUrl)
    : `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
  const node: JsonLdData = {
    "@context": SCHEMA_CONTEXT,
    "@type": "VideoObject",
    name: video.title,
    // No real description field on the Video model yet — a templated line beats
    // echoing the title (Google treats title==description as low quality).
    description: `${video.title} — a calming video from ScoutPaw TV.`,
    thumbnailUrl,
    uploadDate: video.uploadDate,
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    publisher: { "@id": orgId(siteUrl) },
  };
  const duration = isoDuration(video.duration);
  if (duration) node.duration = duration;
  if (typeof video.viewCount === "number") {
    node.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.viewCount,
    };
  }
  return node;
}

/**
 * Product + Offer for a Shopify storefront product. ONLY call this in live
 * Shopify mode — mock products carry placeholder prices that must never ship.
 * Availability defaults to InStock (the storefront query omits stock state).
 */
export function productSchema(product: ShopProduct, siteUrl: string): JsonLdData {
  const node: JsonLdData = {
    "@context": SCHEMA_CONTEXT,
    "@type": "Product",
    name: product.title,
    brand: { "@id": orgId(siteUrl) },
    itemCondition: "https://schema.org/NewCondition",
  };
  if (product.description) node.description = product.description;
  if (product.imageUrl) node.image = product.imageUrl;
  if (product.sku) node.sku = product.sku;
  node.offers = {
    "@type": "Offer",
    price: product.price.amount,
    priceCurrency: product.price.currencyCode,
    availability: product.availableForSale
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    ...(product.onlineStoreUrl ? { url: product.onlineStoreUrl } : {}),
  };
  return node;
}

/** FAQPage from FAQ items. Returns `null` for an empty list (no empty schema). */
export function faqSchema(items: FaqItem[]): JsonLdData | null {
  if (items.length === 0) return null;
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** BreadcrumbList from ordered { name, url } items (urls must be absolute). */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): JsonLdData {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

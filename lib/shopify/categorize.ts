import type { ShopProduct } from "@/lib/shopify/types";

export const SHOP_CATEGORIES = [
  "plushes",
  "apparel",
  "prints",
  "accessories",
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

const CATEGORY_LABELS: Record<ShopCategory, string> = {
  plushes: "Plushes",
  apparel: "Apparel",
  prints: "Prints",
  accessories: "Accessories",
};

const KEYWORD_MAP: Record<ShopCategory, string[]> = {
  plushes: ["plush", "stuffed", "toy", "soft toy", "cuddle"],
  apparel: ["tee", "t-shirt", "shirt", "hoodie", "sweater", "apparel", "wear", "cap", "hat", "sock"],
  prints: ["print", "poster", "art", "wall", "sticker", "decal", "card"],
  accessories: ["mug", "cup", "bottle", "tote", "bag", "keychain", "pin", "patch", "accessory"],
};

/**
 * Best-effort category for a Shopify product. Tokenizes tags + title and
 * matches whole tokens against per-category keyword sets — avoids false
 * positives like "art" matching "smart" or "hat" matching "what".
 * Defaults to "accessories" so every product lands somewhere.
 */
export function categorizeProduct(product: ShopProduct): ShopCategory {
  const tokens = new Set(
    [
      ...product.tags.map((t) => t.toLowerCase()),
      ...product.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
    ],
  );

  for (const cat of SHOP_CATEGORIES) {
    if (tokens.has(cat)) return cat;
    for (const keyword of KEYWORD_MAP[cat]) {
      // Multi-word keywords use substring; single-word use exact-token match.
      if (keyword.includes(" ")) {
        if ([...tokens].join(" ").includes(keyword)) return cat;
      } else if (tokens.has(keyword)) {
        return cat;
      }
    }
  }
  return "accessories";
}

export function categoryLabel(cat: ShopCategory): string {
  return CATEGORY_LABELS[cat];
}

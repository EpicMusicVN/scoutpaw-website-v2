import "server-only";

import { storefrontFetch } from "./client";
import { mockProducts } from "./mock-products";
import { PRODUCTS_QUERY } from "./queries";
import { ShopProductsSchema, type ShopProduct } from "./types";

type LiveResponseNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  onlineStoreUrl: string | null;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

type LiveResponse = {
  products: { nodes: LiveResponseNode[] };
};

function buildStorefrontUrl(handle: string): string | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) return null;
  // Public storefront lives at /products/{handle} regardless of myshopify or
  // custom domain; falls back to null if the env is missing (shouldn't happen
  // in live mode, but typing forces the guard).
  return `https://${domain}/products/${handle}`;
}

function mapNode(node: LiveResponseNode): ShopProduct {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    imageUrl: node.featuredImage?.url ?? null,
    imageAlt: node.featuredImage?.altText ?? null,
    price: node.priceRange.minVariantPrice,
    onlineStoreUrl: node.onlineStoreUrl ?? buildStorefrontUrl(node.handle),
    tags: node.tags ?? [],
  };
}

export async function getProducts(first = 24): Promise<ShopProduct[]> {
  const mode = process.env.SHOPIFY_MODE ?? "mock";

  if (mode === "mock") {
    return ShopProductsSchema.parse(mockProducts);
  }

  try {
    const { data, errors } = await storefrontFetch<LiveResponse>(PRODUCTS_QUERY, {
      first,
    });
    if (errors) {
      console.error(
        "[shopify] GraphQL/HTTP errors:",
        JSON.stringify(errors, null, 2),
      );
      return [];
    }
    if (!data || !data.products) {
      console.error(
        "[shopify] Unexpected response shape — data.products missing:",
        JSON.stringify({ data }, null, 2),
      );
      return [];
    }
    return ShopProductsSchema.parse(data.products.nodes.map(mapNode));
  } catch (err) {
    console.error("[shopify] getProducts failed:", err);
    return [];
  }
}

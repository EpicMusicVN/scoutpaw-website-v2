import { getStorefrontClient } from "./client";
import { mockProducts } from "./mock-products";
import { PRODUCTS_QUERY } from "./queries";
import { ShopProductsSchema, type ShopProduct } from "./types";

type LiveResponseNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  onlineStoreUrl: string | null;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

type LiveResponse = {
  products: { nodes: LiveResponseNode[] };
};

function mapNode(node: LiveResponseNode): ShopProduct {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    imageUrl: node.featuredImage?.url ?? null,
    imageAlt: node.featuredImage?.altText ?? null,
    price: node.priceRange.minVariantPrice,
    onlineStoreUrl: node.onlineStoreUrl,
    tags: node.tags ?? [],
  };
}

export async function getProducts(first = 24): Promise<ShopProduct[]> {
  const mode = process.env.SHOPIFY_MODE ?? "mock";

  if (mode === "mock") {
    return ShopProductsSchema.parse(mockProducts);
  }

  try {
    const client = getStorefrontClient();
    const { data, errors } = await client.request<LiveResponse>(PRODUCTS_QUERY, {
      variables: { first },
    });
    if (errors || !data) {
      console.error("[shopify] Storefront errors:", errors);
      return [];
    }
    return ShopProductsSchema.parse(data.products.nodes.map(mapNode));
  } catch (err) {
    console.error("[shopify] getProducts failed:", err);
    return [];
  }
}

import { createStorefrontApiClient } from "@shopify/storefront-api-client";

let client: ReturnType<typeof createStorefrontApiClient> | null = null;

/**
 * Lazy-init Storefront client. Throws clearly if env vars missing in live mode.
 */
export function getStorefrontClient() {
  if (client) return client;

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const publicAccessToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

  if (!storeDomain || !publicAccessToken) {
    throw new Error(
      "[shopify] SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN must be set in live mode.",
    );
  }

  client = createStorefrontApiClient({
    storeDomain,
    apiVersion: "2024-10",
    publicAccessToken,
  });

  return client;
}

import "server-only";

/**
 * Thin Shopify Storefront GraphQL client. Public-catalog reads, server-only.
 *
 * Uses raw `fetch` so Next.js can cache the response with `revalidate` + tags
 * (instead of an HTTP-client library that bypasses the data cache). Errors
 * are returned in the same `{ data, errors }` shape callers already expect.
 */

const STOREFRONT_API_VERSION = "2024-10";
const REVALIDATE_SECONDS = 3600;
const PRODUCTS_TAG = "shopify-products";

export type StorefrontFetchResult<T> = {
  data?: T;
  errors?: unknown;
};

export async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<StorefrontFetchResult<T>> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

  if (!storeDomain || !storefrontToken) {
    throw new Error(
      "[shopify] SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN must be set in live mode.",
    );
  }

  const url = `https://${storeDomain}/api/${STOREFRONT_API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: REVALIDATE_SECONDS, tags: [PRODUCTS_TAG] },
  });

  // Read once as text so we can surface HTML error pages + malformed JSON
  // without losing the body to a one-shot stream. Trade-off: small string
  // allocation on every call; acceptable for hourly-revalidated data.
  const bodyText = await response.text();

  if (!response.ok) {
    const bodyPreview = bodyText.slice(0, 500);
    console.error(
      `[shopify] HTTP ${response.status} ${response.statusText} from ${storeDomain}; body: ${bodyPreview}`,
    );
    return {
      errors: {
        kind: "http",
        status: response.status,
        statusText: response.statusText,
        bodyPreview,
      },
    };
  }

  try {
    return JSON.parse(bodyText) as StorefrontFetchResult<T>;
  } catch (parseErr) {
    const bodyPreview = bodyText.slice(0, 200);
    console.error(
      `[shopify] JSON parse failed from ${storeDomain}; body starts with: ${bodyPreview}`,
    );
    return {
      errors: {
        kind: "parse",
        message: String(parseErr),
        bodyPreview,
      },
    };
  }
}

export const SHOPIFY_PRODUCTS_TAG = PRODUCTS_TAG;

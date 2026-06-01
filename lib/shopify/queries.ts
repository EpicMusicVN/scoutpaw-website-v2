/**
 * Storefront GraphQL query for catalog products. Storefront API only exposes
 * products that are published to the Online Store sales channel, so no
 * explicit status filter is needed. `priceRange` (not `priceRangeV2`) and
 * `onlineStoreUrl` are the canonical Storefront field names.
 */
export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        description
        tags
        onlineStoreUrl
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

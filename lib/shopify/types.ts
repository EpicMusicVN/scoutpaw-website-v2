import { z } from "zod";

export const ShopMoneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string(),
});

export const ShopProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string().default(""),
  imageUrl: z.string().nullable(),
  imageAlt: z.string().nullable(),
  price: ShopMoneySchema,
  onlineStoreUrl: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  // Stock state + first-variant SKU for richer Product/Offer schema. Defaults
  // keep older/mock entries valid without manual edits.
  availableForSale: z.boolean().default(true),
  sku: z.string().nullable().default(null),
});
export type ShopProduct = z.infer<typeof ShopProductSchema>;
/** Input shape — defaulted fields (availableForSale, sku) are optional. Used by
 * fixtures that are parsed through the schema (which fills the defaults). */
export type ShopProductInput = z.input<typeof ShopProductSchema>;

export const ShopProductsSchema = z.array(ShopProductSchema);

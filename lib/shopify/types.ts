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
});
export type ShopProduct = z.infer<typeof ShopProductSchema>;

export const ShopProductsSchema = z.array(ShopProductSchema);

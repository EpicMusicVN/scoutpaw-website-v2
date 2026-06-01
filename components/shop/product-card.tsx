"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@/lib/analytics/track";
import type { ShopProduct } from "@/lib/shopify/types";

function formatPrice(amount: string, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}

const tileBackgrounds = [
  "var(--bg-warm-tan)",
  "#fffbe6",
  "var(--bg-soft-sky)",
  "var(--bg-peach)",
];

/**
 * Premium sticker-style product card. Cozy shadow at rest, lifts on hover.
 * Honey price pill overlays the top-right of the image. Image tile uses a
 * rotating accent backdrop. Click opens Shopify in a new tab and fires a
 * `BuyNowClick` analytics event (placeholders are no-op).
 */
export function ProductCard({
  product,
  index = 0,
}: {
  product: ShopProduct;
  index?: number;
}) {
  const price = formatPrice(product.price.amount, product.price.currencyCode);
  const buyHref = product.onlineStoreUrl ?? "#";
  const isPlaceholder = buyHref === "#" || buyHref === "#mock-store";
  const tileBg = tileBackgrounds[index % tileBackgrounds.length];

  const onClick = () => {
    if (!isPlaceholder) track("BuyNowClick", { product: product.handle });
  };

  const linkProps = isPlaceholder
    ? {}
    : { target: "_blank" as const, rel: "noopener noreferrer" };

  return (
    <Link
      href={buyHref}
      onClick={onClick}
      aria-label={`Buy ${product.title}${isPlaceholder ? " (coming soon)" : " on Shopify"}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-ink/10 bg-surface shadow-cozy transition-all duration-300 ease-gentle hover:-translate-y-2 hover:shadow-cozy-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
      {...linkProps}
    >
      {product.imageUrl && (
        <div
          className="relative aspect-square w-full overflow-hidden"
          style={{ backgroundColor: tileBg }}
        >
          <Image
            src={product.imageUrl}
            alt={product.imageAlt ?? product.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-7 transition-transform duration-500 ease-out group-hover:scale-110 md:p-9"
          />

          {/* Honey price pill — sticker overlay top-right. Announced to AT
              (no aria-hidden) so screen-reader users hear the price up front. */}
          <span
            className="absolute right-4 top-4 rounded-full bg-brand-primary px-4 py-1.5 font-display text-base font-bold text-ink-blue shadow-cozy md:text-lg"
          >
            {price}
          </span>

          {/* Coming-soon badge — placeholder products only */}
          {isPlaceholder && (
            <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-surface md:text-xs">
              Coming Soon
            </span>
          )}

          {/* Subtle gold accent line that grows on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-brand-primary transition-transform duration-500 ease-out group-hover:scale-x-100"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {product.tags.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 2).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-paper px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-blue/70"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-tight text-ink-blue md:text-xl lg:text-2xl">
          {product.title}
        </h3>

        {/* Action — Buy Now sticker for live products. Placeholders show the
            top-left badge only; no duplicate label here. */}
        {!isPlaceholder && (
          <div className="mt-auto pt-5">
            <span className="cta-shimmer inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-primary px-7 font-display text-base font-bold text-ink-blue shadow-cozy transition-all duration-200 group-hover:shadow-cozy-md">
              Buy Now
              <span
                aria-hidden="true"
                className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1"
              >
                ↗
              </span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

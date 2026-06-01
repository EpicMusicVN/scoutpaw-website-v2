"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@/lib/analytics/track";
import type { CharacterProduct } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Small merchandise card inside a character section — one related product. The
 * whole card links to the external storefront in a new tab and fires a
 * `BuyNowClick` analytics event. The image tile is tinted with the character's
 * accent color so the product reads as part of that character's world.
 */
export function CharacterMerchCard({
  product,
  accentColor,
  ctaLabel = "Shop now",
  ariaActionVerb = "Shop",
}: {
  product: CharacterProduct;
  accentColor: string;
  /** Footer text inside the card (defaults to "Shop now"). */
  ctaLabel?: string;
  /** Verb used in the aria-label (defaults to "Shop"). */
  ariaActionVerb?: string;
}) {
  return (
    <Link
      href={product.ctaHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("BuyNowClick", { product: product.id })}
      aria-label={`${ariaActionVerb} ${product.title} (opens in new tab)`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface shadow-cozy transition-all duration-300 ease-gentle hover:-translate-y-1 hover:shadow-cozy-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      {/* Image tile — accent-tinted (8-digit hex = accent at ~15% alpha) so the
          product sits visually inside the character's themed world. */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ backgroundColor: `${accentColor}26` }}
      >
        <Image
          src={assetUrl(product.image)}
          alt={product.title}
          fill
          sizes="(min-width: 768px) 220px, 45vw"
          className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-surface shadow-cozy">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-ink-blue md:text-base">
          {product.title}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1 font-display text-xs font-semibold text-ink-blue/70">
          {ctaLabel}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </span>
      </div>
    </Link>
  );
}

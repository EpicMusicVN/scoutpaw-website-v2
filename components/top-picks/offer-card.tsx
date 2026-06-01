"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@/lib/analytics/track";
import type { TopPick } from "@/lib/content";
import { TOP_PICK_CATEGORY_LABELS } from "@/lib/content/schemas";
import { assetUrl } from "@/lib/utils/asset-url";

// Rotating accent backdrops — mirrors the ProductCard tile treatment so the
// Top Picks grid reads in the same cozy card language as /shop.
const tileBackgrounds = [
  "var(--bg-warm-tan)",
  "#fffbe6",
  "var(--bg-soft-sky)",
  "var(--bg-peach)",
];

/**
 * Premium sticker-style offer card for a curated Top Pick. Cozy shadow at rest,
 * lifts on hover. Optional discount badge (top-left), popularity pill
 * (top-right), and star rating. The whole card links to the external
 * storefront in a new tab and fires a `BuyNowClick` analytics event — the same
 * external-purchase action ProductCard tracks.
 */
export function OfferCard({ pick, index = 0 }: { pick: TopPick; index?: number }) {
  const tileBg = tileBackgrounds[index % tileBackgrounds.length];

  return (
    <Link
      href={pick.ctaHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("BuyNowClick", { pick: pick.id })}
      aria-label={`${pick.ctaLabel}: ${pick.title} (opens in new tab)`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-ink/10 bg-surface shadow-cozy transition-all duration-300 ease-gentle hover:-translate-y-2 hover:shadow-cozy-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
    >
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ backgroundColor: tileBg }}
      >
        <Image
          src={assetUrl(pick.image)}
          alt={pick.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-7 transition-transform duration-500 ease-out group-hover:scale-110 md:p-9"
        />

        {pick.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-brand-coral px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-surface shadow-cozy md:text-xs">
            {pick.badge}
          </span>
        )}

        {pick.popularity && (
          <span className="absolute right-4 top-4 rounded-full bg-surface/95 px-3 py-1 font-display text-[11px] font-bold text-ink-blue shadow-cozy md:text-xs">
            {pick.popularity}
          </span>
        )}

        {/* Gold accent line that grows on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-brand-primary transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <span className="mb-2 inline-flex w-fit rounded-full bg-paper px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-blue/70">
          {TOP_PICK_CATEGORY_LABELS[pick.category]}
        </span>

        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-tight text-ink-blue md:text-xl">
          {pick.title}
        </h3>

        {pick.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-blue/75 md:text-base">
            {pick.description}
          </p>
        )}

        {pick.rating !== undefined && <StarRating rating={pick.rating} />}

        <div className="mt-auto pt-5">
          <span className="cta-shimmer inline-flex min-h-[48px] items-center justify-center rounded-full bg-brand-primary px-7 font-display text-base font-bold text-ink-blue shadow-cozy transition-all duration-200 group-hover:shadow-cozy-md">
            {pick.ctaLabel}
            <span
              aria-hidden="true"
              className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1"
            >
              ↗
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div
      className="mt-2 flex items-center gap-1.5"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      <span aria-hidden="true" className="flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} filled={i < rounded} />
        ))}
      </span>
      <span className="font-display text-sm font-bold text-ink-blue/80">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className={filled ? "text-brand-gold" : "text-ink-blue/25"}
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

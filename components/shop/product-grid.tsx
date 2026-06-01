"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categorizeProduct, categoryLabel, SHOP_CATEGORIES, type ShopCategory } from "@/lib/shopify/categorize";
import type { ShopProduct } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";

type FilterValue = "all" | ShopCategory;

/**
 * Product grid with client-side category filter chips. Reads `?cat=` from the
 * URL on mount so ExploreProducts tile clicks land on the right filter; users
 * can then flip chips without a roundtrip. Empty state lives in `shop-empty-
 * state.tsx` and is rendered by the page when the source array is empty.
 */
export function ProductGrid({ products }: { products: ShopProduct[] }) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterValue>("all");

  // Sync from URL once on mount + whenever the query param changes.
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && (SHOP_CATEGORIES as readonly string[]).includes(cat)) {
      setFilter(cat as ShopCategory);
    } else if (!cat) {
      setFilter("all");
    }
  }, [searchParams]);

  // Memoize per-product category so we only categorize once per filter switch.
  const indexed = useMemo(
    () => products.map((p) => ({ product: p, category: categorizeProduct(p) })),
    [products],
  );

  const filtered = useMemo(
    () => (filter === "all" ? indexed : indexed.filter((p) => p.category === filter)),
    [filter, indexed],
  );

  return (
    <>
      {/* Filter chips */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:mt-10 md:gap-3">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
        />
        {SHOP_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
            label={categoryLabel(cat)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center font-display text-lg text-ink-blue/70">
          No products in this category yet — check back soon.
        </p>
      ) : (
        <ul
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
          aria-live="polite"
        >
          {filtered.map(({ product }, idx) => (
            <li key={product.id} className="h-full">
              <ProductCard product={product} index={idx} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[40px] items-center rounded-full px-5 font-display text-sm font-semibold uppercase tracking-wider transition-all duration-200 ease-gentle md:text-base ${
        active
          ? "bg-ink text-surface shadow-cozy"
          : "bg-surface text-ink-blue border border-ink/15 shadow-sm hover:-translate-y-0.5 hover:bg-brand-primary/30 hover:border-ink/30"
      }`}
    >
      {label}
    </button>
  );
}

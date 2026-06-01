"use client";

import { useMemo, useState } from "react";
import { DealBlock as DealBlockCard } from "@/components/top-picks/deal-block";
import { OfferCard } from "@/components/top-picks/offer-card";
import { FilterChip } from "@/components/ui/filter-chip";
import type { DealBlock, TopPick, TopPickCategory } from "@/lib/content";
import {
  TOP_PICK_CATEGORIES,
  TOP_PICK_CATEGORY_LABELS,
} from "@/lib/content/schemas";

type Filter = TopPickCategory | "all";

/**
 * TopPicksBoard — interactive core of /top-picks. Owns the active-category
 * filter state. Renders the deal spotlight (now a static editorial card —
 * pivot #8 dropped the accordion toggle), the category chips, and an
 * always-visible offer-card grid.
 */
export function TopPicksBoard({
  deal,
  picks,
}: {
  deal: DealBlock;
  picks: TopPick[];
}) {
  const [active, setActive] = useState<Filter>("all");

  const filtered = useMemo(
    () => (active === "all" ? picks : picks.filter((p) => p.category === active)),
    [active, picks],
  );

  return (
    <section className="mx-auto max-w-hero px-4 py-16 md:px-8 md:py-24">
      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cobalt md:text-sm">
          Top Picks
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold heading-sticker-honey md:text-5xl lg:text-6xl">
          The pack&rsquo;s favourite finds.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-ink-blue/85 md:text-lg">
          Hand-picked gear for happy pups and the humans who love them. Pick a
          category to narrow the grid below.
        </p>
        <p
          className="mx-auto mt-4 max-w-2xl text-xs italic text-ink-blue/60 md:text-sm"
          role="note"
        >
          As an Amazon Associate we earn from qualifying purchases. Featured
          products link to Amazon and open in a new tab.
        </p>
      </header>

      {/* Deal Block — static editorial card; no longer toggles the grid. */}
      <div className="mt-10 md:mt-12">
        <DealBlockCard deal={deal} />
      </div>

      {/* Category chips — toggle-button group; clicking re-filters the grid. */}
      <div
        role="group"
        aria-label="Filter picks by category"
        className="mt-10 flex flex-wrap justify-center gap-2 md:mt-12 md:gap-3"
      >
        <FilterChip active={active === "all"} onClick={() => setActive("all")}>
          All
        </FilterChip>
        {TOP_PICK_CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            active={active === c}
            onClick={() => setActive(c)}
          >
            {TOP_PICK_CATEGORY_LABELS[c]}
          </FilterChip>
        ))}
      </div>

      {/* Offer grid — always visible. */}
      <div className="mt-10 md:mt-12">
        {filtered.length === 0 ? (
          <p className="text-center text-base text-ink-blue/70 md:text-lg">
            No picks in this category yet — check back soon. 🐾
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((pick, i) => (
              <li key={pick.id}>
                <OfferCard pick={pick} index={i} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/**
 * Shop loading skeleton — mirrors the redesigned page layout to avoid a
 * color/width flash on hydration.
 *   Hero: cream `bg-paper`, two-zone grid inside `max-w-hero`.
 *   Explore Products: 4 sticker tiles.
 *   Product grid: filter chips + 6 cards.
 */
export default function ShopLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="relative bg-paper">
        <div className="mx-auto grid max-w-hero items-center gap-8 px-4 pb-16 pt-10 md:grid-cols-[1.05fr_1fr] md:gap-12 md:px-8 md:pb-24 md:pt-16 lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="aspect-square w-full md:aspect-auto md:h-[540px] lg:h-[620px]">
            <SkeletonLine className="h-full w-full rounded-[2rem]" />
          </div>
          <div className="rounded-[2.5rem] border border-ink/10 bg-surface p-7 shadow-cozy-xl md:p-10 lg:p-12">
            <SkeletonLine className="h-4 w-32" />
            <SkeletonLine className="mt-4 h-14 w-full md:h-20" />
            <SkeletonLine className="mt-2 h-14 w-3/4 md:h-20" />
            <SkeletonLine className="mt-6 h-5 w-full" />
            <SkeletonLine className="mt-2 h-5 w-5/6" />
            <div className="mt-8 flex gap-3">
              <SkeletonLine className="h-12 w-32 rounded-full" />
              <SkeletonLine className="h-12 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Products skeleton */}
      <section className="mx-auto max-w-hero px-4 py-24 md:px-8 md:py-32">
        <div className="text-center">
          <SkeletonLine className="mx-auto h-4 w-40" />
          <SkeletonLine className="mx-auto mt-3 h-12 w-96 md:h-16" />
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-5 md:gap-7 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <li key={i}>
              <SkeletonLine className="aspect-[4/5] w-full rounded-[2rem]" />
            </li>
          ))}
        </ul>
      </section>

      {/* Product grid skeleton */}
      <section className="mx-auto max-w-hero px-4 py-12 md:px-8 md:py-16">
        <div className="flex justify-center gap-2 md:gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonLine key={i} className="h-10 w-20 rounded-full md:w-24" />
          ))}
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <li key={i}>
              <SkeletonLine className="aspect-[3/4] w-full rounded-[2rem]" />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-paper ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer-slide_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

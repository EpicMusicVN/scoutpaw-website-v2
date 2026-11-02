/**
 * Watch loading skeleton — mirrors the redesigned page layout (`max-w-hero`,
 * featured hero card, latest-uploads rail, library) so first paint doesn't
 * shift width when WatchPage data resolves.
 */
export default function WatchLoading() {
  return (
    <>
      {/* Page header */}
      <section className="mx-auto max-w-hero px-4 pt-16 pb-6 md:px-8 md:pt-24 md:pb-10">
        <div className="text-center">
          <SkeletonLine className="mx-auto h-4 w-32" />
          <SkeletonLine className="mx-auto mt-3 h-14 w-3/4 md:h-20" />
          <SkeletonLine className="mx-auto mt-5 h-5 w-2/3" />
        </div>
      </section>

      {/* Featured video skeleton */}
      <section className="mx-auto max-w-hero px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-10">
        <div className="grid items-stretch gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-10">
          <SkeletonLine className="aspect-video rounded-[2rem]" />
          <SkeletonLine className="rounded-[2rem]" />
        </div>
      </section>

      {/* Rail skeleton */}
      <section className="mx-auto max-w-hero px-4 py-12 md:px-8 md:py-16">
        <SkeletonLine className="h-8 w-48" />
        <ul className="-mx-4 mt-8 flex gap-6 overflow-hidden px-4 md:-mx-8 md:px-8">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="w-[78%] shrink-0 sm:w-[44%] md:w-[32%] lg:w-[26%]"
            >
              <SkeletonLine className="aspect-video rounded-[1.5rem]" />
              <SkeletonLine className="mt-4 h-5 w-4/5" />
            </li>
          ))}
        </ul>
      </section>

      {/* Playlist skeleton */}
      <section className="mx-auto max-w-hero px-4 py-16 md:px-8 md:py-24">
        <div className="text-center">
          <SkeletonLine className="mx-auto h-4 w-32" />
          <SkeletonLine className="mx-auto mt-3 h-12 w-80 md:h-16" />
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <SkeletonLine className="aspect-[4/3] rounded-[2rem]" />
              <SkeletonLine className="mt-4 h-6 w-2/3" />
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

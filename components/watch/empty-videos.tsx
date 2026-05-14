import { PawIcon } from "@/components/ui/paw-icon";

/**
 * Empty-state card shared by Watch rails when a filter or category returns
 * zero videos. Cozy gradient + paw icon + headline + tagline. Preserves
 * vertical rhythm so the section doesn't collapse when empty.
 */
export function EmptyVideos({
  tagline = "Fresh episodes coming soon 🐾",
}: {
  tagline?: string;
}) {
  return (
    <div className="mx-auto mt-10 max-w-md md:mt-12">
      <div
        className="group relative overflow-hidden rounded-3xl border border-ink/10 p-10 text-center shadow-cozy transition-all duration-500 ease-gentle hover:-translate-y-0.5 hover:shadow-cozy-md md:p-12"
        style={{
          background:
            "linear-gradient(135deg, var(--bg-warm-tan) 0%, var(--bg-soft-sky) 100%)",
        }}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-brand-gold shadow-sm md:h-16 md:w-16">
          <PawIcon className="h-7 w-7 md:h-8 md:w-8" />
        </div>
        <p className="mt-5 font-display text-xl font-bold uppercase tracking-[0.18em] text-ink md:text-2xl">
          No Videos
        </p>
        <p className="mt-2 text-sm text-warm-text/85 md:text-base">{tagline}</p>
      </div>
    </div>
  );
}

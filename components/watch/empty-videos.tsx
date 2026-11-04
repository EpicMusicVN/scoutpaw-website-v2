import { PupNoseRow } from "@/components/ui/pup-nose";

/**
 * Empty-state card shared by Watch rails when a filter or category returns
 * zero videos. Cozy gradient + a row of the pack's noses + headline + tagline. Preserves
 * vertical rhythm so the section doesn't collapse when empty.
 */
export function EmptyVideos({
  tagline = "Fresh episodes coming soon",
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
        <PupNoseRow className="gap-1.5" noseClassName="h-8 w-8 md:h-9 md:w-9" />
        <p className="mt-5 font-display text-xl font-bold uppercase tracking-[0.18em] text-ink-blue md:text-2xl">
          No Videos
        </p>
        <p className="mt-2 text-sm text-ink-blue/85 md:text-base">{tagline}</p>
      </div>
    </div>
  );
}

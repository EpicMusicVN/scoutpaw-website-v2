import Image from "next/image";
import type { DealBlock as DealBlockData } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Deal Block — featured-offer editorial card. Pivot #8 dropped the accordion
 * toggle that previously expanded the offer grid; the grid is now always
 * visible below, so this card stands alone as the featured-drop spotlight.
 * Title color = `text-ink-blue` per pivot #8 brief.
 */
export function DealBlock({ deal }: { deal: DealBlockData }) {
  return (
    <article
      className="relative block w-full overflow-hidden rounded-[2.5rem] border border-ink/10 shadow-cozy-md"
      style={{
        background:
          "linear-gradient(120deg, var(--bg-warm-tan) 0%, var(--brand-primary) 55%, var(--bg-peach) 100%)",
      }}
    >
      <div className="relative grid items-stretch md:grid-cols-[1.3fr_1fr]">
        {/* Copy column */}
        <div className="relative z-10 px-6 py-10 md:py-12 md:pl-12 md:pr-8">
          <span className="inline-flex rounded-full bg-ink px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-surface md:text-xs">
            {deal.badge}
          </span>
          <h3 className="mt-4 font-display text-3xl font-bold leading-[1.05] text-ink-blue md:text-4xl lg:text-5xl">
            {deal.title}
          </h3>
          <p className="mt-3 max-w-md text-base text-ink-blue/85 md:text-lg">
            {deal.description}
          </p>
        </div>

        {/* Media column — full-bleed to the card edge */}
        <div className="relative aspect-[16/10] w-full md:aspect-auto md:min-h-[320px]">
          <Image
            src={assetUrl(deal.image)}
            alt=""
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </article>
  );
}

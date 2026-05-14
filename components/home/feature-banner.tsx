import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * Wide horizontal feature banner — Shop spotlight on the home page.
 * Contained rounded card with a warm-tan → yellow → peach gradient bg. Inside:
 * a magazine-style split — copy on one side, full-bleed image filling the other
 * side edge-to-edge of the card.
 */
export function FeatureBanner({
  kicker,
  title,
  body,
  subDescription,
  cta,
  href,
  image,
  imageAlt,
  reverse = false,
}: {
  kicker?: string;
  title: string;
  body: string;
  subDescription?: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <section className="relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16">
      <div
        className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 shadow-cozy-md"
        style={{
          background:
            "linear-gradient(120deg, var(--bg-warm-tan) 0%, var(--brand-primary) 55%, var(--bg-peach) 100%)",
        }}
      >
        <div
          className={`relative grid items-stretch md:grid-cols-[1fr_1.4fr] ${
            reverse ? "md:[&>div:first-child]:order-2" : ""
          }`}
        >
          {/* Copy column — padded inside the card. */}
          <div className="relative z-10 px-4 py-16 md:py-20 md:pl-12 md:pr-8">
            {kicker && (
              <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm">
                {kicker}
              </p>
            )}
            <h2 className="mt-3 font-display text-5xl font-bold leading-[0.98] text-ink md:text-6xl lg:text-7xl">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-base text-warm-text md:text-lg lg:text-xl">
              {body}
            </p>
            {subDescription && (
              <p className="mt-4 max-w-md text-sm italic text-warm-muted md:text-base">
                {subDescription}
              </p>
            )}
            <div className="mt-8">
              <Button href={href} size="lg" variant="dark">
                {cta}
              </Button>
            </div>
          </div>

          {/* Media column — full-bleed to card edge, no padding. */}
          <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[460px] lg:min-h-[540px]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

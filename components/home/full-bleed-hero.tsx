import Image from "next/image";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Letterbox hero with yellow gradient zones anchoring it to the yellow navbar
 * above and the FeatureBanner below. Left ~40% yellow zone hosts text on solid
 * yellow for max legibility; right ~25% mirror fade frames the image.
 *
 * Mobile (<md): banner at aspect-[4/3]; yellow-tinted glass card flows below.
 * md+: banner at aspect-[16/9] inside max-w-[1600px]; text sits on the left
 * yellow zone, characters remain fully visible in center.
 */
export function FullBleedHero({
  kicker,
  title,
  description,
  image = assetUrl("banner/banner.png"),
  imageAlt = "ScoutPaw — meet the pack of cartoon dogs welcoming you to ScoutPaw TV",
}: {
  kicker: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}) {
  const CardBody = () => (
    <>
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm">
        {kicker}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl xl:text-[3.5rem]">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-warm-text lg:text-lg">
        {description}
      </p>
    </>
  );

  return (
    <section className="relative isolate bg-paper">
      {/* Banner — natural 16:9 inside max-w-[1600px]. Cyan page bg shows in
          gutters beyond 1600px. */}
      <div className="relative mx-auto w-full max-w-[1600px] aspect-[4/3] md:aspect-[16/9]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="(min-width: 1600px) 1600px, 100vw"
          className="object-cover"
          style={{ objectPosition: "70% 50%" }}
        />
        {/* Left cyan fade — banner image melts into the page bg. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-paper via-paper/70 to-transparent md:block"
        />
        {/* Right cyan fade — image visually merges into the page bg below. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-paper via-paper/60 to-transparent md:block"
        />
      </div>

      {/* Mobile: in-flow white-tinted glass card below banner. */}
      <div className="relative mx-4 -mt-8 max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-cozy-xl backdrop-blur-xl md:hidden">
        <CardBody />
      </div>

      {/* Desktop: top-left glass blob tucked under the navbar. A radial mask
          fades the white tint + backdrop-blur into the banner imagery at the
          edges, so the text reads on a soft glow instead of a hard UI rectangle.
          Character faces (Home) and products (Shop) keep visual focus. */}
      <div className="pointer-events-none absolute inset-0 hidden items-start md:flex">
        <div className="pointer-events-auto mx-auto w-full max-w-hero px-8 pt-12 lg:pt-16">
          <div className="relative max-w-sm px-8 py-7 lg:max-w-md lg:px-10 lg:py-9">
            {/* Glass blob — bg tint + blur, edges fade via radial mask.
                inset-[-1.5rem] extends the visual layer beyond the text
                container so the fade has falloff room. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[-1.5rem] bg-white/55 backdrop-blur-xl"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)",
                maskImage:
                  "radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)",
              }}
            />
            <div className="relative">
              <CardBody />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

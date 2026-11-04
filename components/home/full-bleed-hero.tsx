import Image from "next/image";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Letterbox hero. A left page-colour fade hosts the text block on a soft glass
 * glow; a narrow right fade melts the image edge into the page.
 *
 * Mobile (<md): banner at aspect-[4/3]; white glass card flows below.
 * md+: banner at aspect-[16/9] inside max-w-[1600px]; text sits on the left
 * fade, characters remain fully visible in the centre/right.
 *
 * The default image is the 2D pack scene. Its pups stand in the right ~70%, so
 * it anchors right — the 4:3 mobile crop then keeps all five in frame — and
 * gets a narrower right fade. Custom images keep the original 70% focal point
 * and fade.
 */
const DEFAULT_IMAGE_KEY = "brand/scene/pack-scene.webp";

export function FullBleedHero({
  kicker,
  title,
  description,
  image,
  imageAlt = "ScoutPaw — Max, Bella, Rocky, Buddy and Oscar, the pack of cartoon dogs welcoming you to ScoutPaw TV",
}: {
  kicker: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}) {
  const src = image ?? assetUrl(DEFAULT_IMAGE_KEY);
  const objectPosition = image ? "70% 50%" : "100% 50%";

  const CardBody = () => (
    <>
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cobalt md:text-sm">
        {kicker}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-[1.05] heading-sticker-honey md:text-4xl lg:text-5xl xl:text-[3.5rem]">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-blue lg:text-lg">
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
          src={src}
          alt={imageAlt}
          fill
          priority
          sizes="(min-width: 1600px) 1600px, 100vw"
          className="object-cover"
          style={{ objectPosition }}
        />
        {/* Left cyan fade — banner image melts into the page bg. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-paper via-paper/70 to-transparent md:block"
        />
        {/* Right cyan fade — image visually merges into the page bg below.
            Kept narrow on the pack scene so Oscar, at its right edge, stays
            visible. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 hidden bg-gradient-to-l from-paper via-paper/60 to-transparent md:block ${
            image ? "w-1/3" : "w-[12%]"
          }`}
        />
      </div>

      {/* Hero text — rendered ONCE so CSS-blind crawlers see a single <h1> and
          a single description string (the prior dual-render emitted two of each,
          tripping duplicate-H1 / duplicate-text SEO checks).
          Mobile (<md): in-flow white-tinted glass card below the banner.
          md+: the same node becomes a top-left glass blob absolutely overlaying
          the banner, tucked under the navbar. A radial mask fades the white tint
          + backdrop-blur into the banner imagery so the text reads on a soft glow
          instead of a hard UI rectangle. */}
      <div className="relative md:pointer-events-none md:absolute md:inset-0 md:flex md:items-start">
        <div className="mx-4 -mt-8 max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-cozy-xl backdrop-blur-xl md:pointer-events-auto md:mx-auto md:mt-0 md:w-full md:max-w-hero md:rounded-none md:border-0 md:bg-transparent md:p-0 md:px-8 md:pt-12 md:shadow-none md:backdrop-blur-none lg:pt-16">
          <div className="relative md:max-w-sm md:px-8 md:py-7 lg:max-w-md lg:px-10 lg:py-9">
            {/* Glass blob — desktop only (mobile uses the card surface above).
                inset-[-1.5rem] extends the visual layer beyond the text
                container so the radial fade has falloff room. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[-1.5rem] hidden bg-white/55 backdrop-blur-xl md:block"
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

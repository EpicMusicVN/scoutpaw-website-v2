import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/lib/utils/asset-url";

type Card = {
  label: string;
  copy: string;
  image: string;
  href: string;
  bg: string;
  // Saturated tint behind the transparent icon. Renders as a blurred radial
  // glow to ground the floating PNG on the colored card surface.
  accentGlow: string;
  comingSoon?: boolean;
};

/**
 * Floating two-card grid for ScoutPaw destinations. Each item is an image
 * card (colored bg + transparent icon) stacked above a narrower text card
 * (bg-surface, -mt-10 overlap, mx-4). Hover lifts the image card more than
 * the text card to create a "floating" effect.
 */
export function MenuCards() {
  // All known menu destinations. Add hrefs to LIVE_HREFS as sections come
  // online (music, activities, events, blog) — definitions stay in source
  // so re-enabling is a one-line change.
  const allCards: Card[] = [
    {
      label: "CHARACTERS",
      copy: "Learn more about Buddy, Max, and all your favorite furry friends from the pack!",
      image: assetUrl("card/characters.png"),
      href: "#meet-the-pack",
      bg: "var(--bg-soft-sky)",
      accentGlow: "var(--brand-primary)",
    },
    {
      label: "SHOP",
      copy: "Treat your pup to new favorites and grab something cute for yourself! From doggy essentials to fun human gear, there's a little magic here for both of you.",
      image: assetUrl("card/shop.png"),
      href: "/shop",
      bg: "var(--bg-peach)",
      accentGlow: "var(--bg-blush)",
    },
    {
      label: "WATCH",
      copy: "Experience every musical adventure and cartoon designed to keep your pup company all day.",
      image: assetUrl("card/watch.png"),
      href: "/watch",
      bg: "var(--bg-warm-tan)",
      accentGlow: "var(--bg-sky-deep)",
    },
  ];

  // Only the three destinations with real data go live. Add hrefs here as
  // sections come online (e.g. "/coming-soon/music").
  const LIVE_HREFS = new Set(["#meet-the-pack", "/shop", "/watch"]);
  const visible = allCards.filter((c) => LIVE_HREFS.has(c.href));

  return (
    <section className="relative mx-auto max-w-hero overflow-hidden px-4 py-20 md:px-8 md:py-28">
      {/* Decorative pattern layer — playful dog-themed icons scattered behind
          the cards at low opacity. pointer-events-none + aria-hidden so cards
          stay fully interactive and screen readers ignore. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.10] text-warm-text"
      >
        <DecorPaw className="absolute left-[5%] top-[8%] h-10 w-10 -rotate-12" />
        <DecorBone className="absolute right-[8%] top-[14%] h-12 w-12 rotate-[18deg]" />
        <DecorBall className="absolute left-[10%] top-[48%] h-8 w-8 rotate-[8deg]" />
        <DecorPaw className="absolute right-[6%] top-[52%] h-9 w-9 -rotate-[20deg]" />
        <DecorBone className="absolute left-[8%] bottom-[12%] h-10 w-10 -rotate-[8deg]" />
        <DecorPaw className="absolute right-[14%] bottom-[10%] h-12 w-12 rotate-[12deg]" />
      </div>

      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-gold md:text-sm">
          The ScoutPaw World
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl lg:text-6xl">
          Step into the pack&apos;s world
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-warm-text md:text-lg">
          Whether you&apos;re here to meet the pack, find some new favorites, or start the music, there&apos;s something special for every pup and their hooman to discover!
        </p>
      </header>

      {/* 3-column on desktop, single-column on mobile. `auto-rows-fr` keeps
          outer link wrappers the same height across the row. */}
      <ul className="mt-12 grid grid-cols-1 gap-6 auto-rows-fr md:grid-cols-3 md:gap-7">
        {visible.map((card) => (
          <li key={card.label}>
            <MenuCard card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MenuCard({ card }: { card: Card }) {
  const content = (
    <>
      {card.comingSoon && (
        <span className="absolute right-3 top-3 z-20 rounded-full bg-ink/85 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-surface md:text-xs">
          Coming Soon
        </span>
      )}

      {/* Floating image card — small, centered, z-10 so it sits visually
          above the text card's overlap zone. */}
      <div
        className="relative z-10 mx-auto h-40 w-40 overflow-hidden rounded-3xl shadow-cozy-md transition-all duration-500 ease-gentle group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-cozy-lg md:h-44 md:w-44 lg:h-48 lg:w-48"
        style={{ background: card.bg }}
      >
        {/* Subtle repeating paw-print pattern behind subject — gives each card
            a playful in-frame texture without competing with the product image. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url('${assetUrl("patterns/paw-tile.svg")}')`,
            backgroundSize: "48px 48px",
            backgroundRepeat: "repeat",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1/4 top-1/4 h-1/2 rounded-full opacity-40 blur-2xl"
          style={{ backgroundColor: card.accentGlow }}
        />
        <Image
          src={card.image}
          alt=""
          fill
          sizes="(min-width:1024px) 192px, (min-width:640px) 176px, 160px"
          className="object-contain p-3 drop-shadow-[0_12px_18px_rgba(43,29,16,0.22)]"
          aria-hidden="true"
        />
      </div>

      {/* Text card — full column width, pulled up under the image card so
          the image's bottom half visually overlaps the text card top. */}
      <div className="relative flex flex-1 flex-col -mt-20 rounded-3xl bg-surface px-6 pb-6 pt-28 shadow-cozy transition-all duration-500 ease-gentle group-hover:shadow-cozy-md md:-mt-[88px] md:px-7 md:pb-7 md:pt-32 lg:-mt-24 lg:pt-36">
        <h3 className="font-display text-xl font-bold text-ink md:text-2xl">{card.label}</h3>
        <p className="mt-1.5 text-sm text-warm-text md:text-base">{card.copy}</p>
        {!card.comingSoon && (
          <span className="mt-auto inline-flex w-fit items-center rounded-full bg-navy px-5 py-2 font-display text-sm font-semibold text-white shadow-sm transition-all duration-500 ease-gentle group-hover:-translate-y-0.5 group-hover:shadow-md md:text-base">
            View All
          </span>
        )}
      </div>
    </>
  );

  const wrapperClass =
    "group relative flex h-full flex-col transition-transform duration-500 ease-gentle hover:-translate-y-1";

  if (card.comingSoon) {
    return (
      <div
        role="link"
        aria-disabled="true"
        aria-label={`${card.label} — Coming Soon`}
        className={wrapperClass}
      >
        {content}
      </div>
    );
  }
  return (
    <Link href={card.href} className={wrapperClass}>
      {content}
    </Link>
  );
}

/**
 * Section decoration icons — inline SVG, currentColor-driven so the parent
 * decoration layer controls tint + opacity. ViewBox 0 0 32 32 keeps them
 * uniform. aria-hidden because they're purely decorative.
 */
function DecorPaw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="16" cy="22" rx="6.5" ry="5.5" />
      <ellipse cx="7" cy="13" rx="2.5" ry="3.5" />
      <ellipse cx="13" cy="9" rx="2.5" ry="3.5" />
      <ellipse cx="19" cy="9" rx="2.5" ry="3.5" />
      <ellipse cx="25" cy="13" rx="2.5" ry="3.5" />
    </svg>
  );
}

function DecorBone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="6" cy="9" r="4" />
      <circle cx="6" cy="15" r="4" />
      <circle cx="26" cy="17" r="4" />
      <circle cx="26" cy="23" r="4" />
      <path d="M9 11 L23 19 L23 21 L9 13 Z" />
    </svg>
  );
}

function DecorBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="13" />
      <path d="M5 12 Q16 8 27 12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M5 20 Q16 24 27 20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

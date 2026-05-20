import Image from "next/image";
import { categoryLabel, type ShopCategory } from "@/lib/shopify/categorize";
import { assetUrl } from "@/lib/utils/asset-url";

type Tile = {
  category: ShopCategory;
  // Optional visible label override. Falls back to categoryLabel(category)
  // so routing/category slugs stay stable while marketing copy can drift.
  title?: string;
  copy: string;
  bg: string;
  rotate: string;
  image: string;
  // External storefront URL. When set, the card opens it in a new tab.
  href?: string;
};

// Full set of category tiles. Non-visible ones stay in source so re-enabling
// is a one-line change in VISIBLE_CATEGORIES below when product data lands.
const ALL_TILES: Tile[] = [
  {
    category: "plushes",
    title: "Dog Calming & Essentials Collection",
    copy: "Shop our curated collection for pet anxiety, comfort, and wellness. Free your pup from stress today!",
    bg: "var(--bg-warm-tan)",
    rotate: "-rotate-2",
    image: assetUrl("shop/1.jpg"),
    href: "https://linktr.ee/puppycaretaker.shop",
  },
  {
    category: "apparel",
    title: "Dog owner gifts",
    copy: "Keep your pup close to your heart with essentials designed to celebrate your unbreakable bond.",
    bg: "#fffbe6",
    rotate: "rotate-2",
    image: assetUrl("shop/2.jpg"),
    href: "https://puppylullabytv-shop.fourthwall.com/",
  },
  {
    category: "prints",
    copy: "Wall art, posters, and stickers. Bring the pack home.",
    bg: "var(--bg-peach)",
    rotate: "-rotate-1",
    image: assetUrl("characters/corgi-bg.png"),
  },
  {
    category: "accessories",
    copy: "Mugs, totes, and the small things that make a home.",
    bg: "var(--bg-soft-sky)",
    rotate: "rotate-1",
    image: assetUrl("characters/poodle-bg.png"),
  },
];

const VISIBLE_CATEGORIES: ShopCategory[] = ["plushes", "apparel"];
const TILES: Tile[] = ALL_TILES.filter((t) =>
  VISIBLE_CATEGORIES.includes(t.category),
);

/**
 * Sticker-style category tiles. Each tile carries a slight rotation at rest
 * and settles to 0° on hover, mirroring the Home menu cards. The whole card
 * links out to the tile's external storefront (`href`), opening in a new tab.
 * Mobile collapses to a 2×2 grid.
 */
export function ExploreProducts() {
  return (
    <section className="mx-auto max-w-hero px-4 py-24 md:px-8 md:py-32">
      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
          Explore Products
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl lg:text-7xl">
          Find Your Pup&rsquo;s Favourite.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-warm-text md:text-lg">
          Curated picks for the whole pack — calming essentials for pups + gifts for the humans who love them.
        </p>
      </header>

      <ul className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
        {TILES.map((tile) => (
          <li key={tile.category}>
            <a
              href={tile.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cat={tile.category}
              className="group block rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
              aria-label={`Shop ${tile.title ?? categoryLabel(tile.category)} (opens in new tab)`}
            >
              {/* Unified card — image area + text area inside one rounded
                  container so the tile reads as a single editorial unit. The
                  whole card tilts at rest (sticker feel) and untilts on hover. */}
              <div
                className={`relative overflow-hidden rounded-[2rem] bg-surface shadow-cozy transition-all duration-500 ease-gentle ${tile.rotate} group-hover:-translate-y-2 group-hover:shadow-cozy-xl`}
              >
                {/* Image area — colored tile bg, square aspect, padded inset. */}
                <div className="relative aspect-square" style={{ backgroundColor: tile.bg }}>
                  <div className="absolute inset-0 p-6 md:p-8">
                    <Image
                      src={tile.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-contain object-center transition-transform duration-500 ease-gentle group-hover:scale-105"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Text area — flush below image area, inherits surface bg
                    from the parent card so the tile reads as one unit. */}
                <div className="p-5 md:p-6">
                  <h3 className="font-display text-xl font-bold text-ink md:text-2xl">
                    {tile.title ?? categoryLabel(tile.category)}
                  </h3>
                  <p className="mt-1 text-sm text-warm-text md:text-base">{tile.copy}</p>
                  <span className="mt-2 inline-flex items-center gap-1 font-display text-sm font-semibold text-brand-gold">
                    Shop
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

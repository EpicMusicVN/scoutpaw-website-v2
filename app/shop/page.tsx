import type { Metadata } from "next";
import { FullBleedHero } from "@/components/home/full-bleed-hero";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AboutShop } from "@/components/shop/about-shop";
import { ExploreProducts } from "@/components/shop/explore-products";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopEmptyState } from "@/components/shop/shop-empty-state";
import { CloudDivider } from "@/components/ui/cloud-divider";
import { getProducts } from "@/lib/shopify/get-products";
import { assetUrl } from "@/lib/utils/asset-url";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop ScoutPaw merchandise — plushes, posters, stickers and more.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <FullBleedHero
        kicker="ScoutPaw Shop"
        title="Bring the pack home."
        description="Plushes, prints, and apparel — every Buy Now opens our Shopify store in a new tab."
        image={assetUrl("shop/banner.jpg")}
        imageAlt="ScoutPaw shop banner"
      />

      <CloudDivider />

      <ScrollReveal>
        <div id="explore">
          <ExploreProducts />
        </div>
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <section
          id="products"
          className="mx-auto max-w-hero px-4 py-24 md:px-8 md:py-32"
        >
          <header className="text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cobalt md:text-sm">
              From the Shop
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold heading-sticker-honey md:text-6xl lg:text-7xl">
              Fresh from the kennel.
            </h2>
          </header>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="mt-14">
              <ShopEmptyState />
            </div>
          )}
        </section>
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <AboutShop />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <NewsletterCTA tag="shop-newsletter" />
      </ScrollReveal>
    </>
  );
}

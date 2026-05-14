import type { Metadata } from "next";
import { FullBleedHero } from "@/components/home/full-bleed-hero";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AboutShop } from "@/components/shop/about-shop";
import { ExploreProducts } from "@/components/shop/explore-products";
import { CloudDivider } from "@/components/ui/cloud-divider";
import { assetUrl } from "@/lib/utils/asset-url";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop ScoutPaw merchandise — plushes, posters, stickers and more.",
};

export default function ShopPage() {
  return (
    <>
      <FullBleedHero
        kicker="ScoutPaw Shop"
        title="Bring the pack home."
        description="Plushes, prints, and apparel — every Buy Now opens our Shopify store in a new tab."
        image={assetUrl("shop/banner.png")}
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
        <AboutShop />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <NewsletterCTA tag="shop-newsletter" />
      </ScrollReveal>
    </>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { FullBleedHero } from "@/components/home/full-bleed-hero";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AboutShop } from "@/components/shop/about-shop";
import { ExploreProducts } from "@/components/shop/explore-products";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopEmptyState } from "@/components/shop/shop-empty-state";
import { CloudDivider } from "@/components/ui/cloud-divider";
import { JsonLd } from "@/components/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site-url";
import { breadcrumbSchema, productSchema } from "@/lib/seo/structured-data";
import { getProducts } from "@/lib/shopify/get-products";
import { assetUrl } from "@/lib/utils/asset-url";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop ScoutPaw merchandise — plushes, posters, stickers and more.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  // Breadcrumb needs no product data, so it renders immediately with the page
  // shell. Product/Offer schema lives in <ShopProducts> (live mode only) so the
  // Shopify fetch never blocks first paint.
  const siteUrl = getSiteUrl();
  const shopBreadcrumb = breadcrumbSchema([
    { name: "Home", url: `${siteUrl}/` },
    { name: "Shop", url: `${siteUrl}/shop` },
  ]);

  return (
    <>
      <JsonLd data={[shopBreadcrumb]} />
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
          <Suspense fallback={<ProductGridSkeleton />}>
            <ShopProducts siteUrl={siteUrl} />
          </Suspense>
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

/**
 * Streamed product area. Awaiting the Shopify fetch here (rather than in the
 * page body) lets the page shell + hero paint immediately while products load
 * behind a skeleton. Emits Product/Offer JSON-LD only in live Shopify mode —
 * mock prices must never ship as structured data.
 */
async function ShopProducts({ siteUrl }: { siteUrl: string }) {
  const products = await getProducts();
  const isLiveShopify = (process.env.SHOPIFY_MODE ?? "mock") !== "mock";
  const productSchemas = isLiveShopify
    ? products.map((p) => productSchema(p, siteUrl))
    : [];

  return (
    <>
      {productSchemas.length > 0 ? <JsonLd data={productSchemas} /> : null}
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="mt-14">
          <ShopEmptyState />
        </div>
      )}
    </>
  );
}

/** Suspense fallback — mirrors ProductGrid's chips + card grid layout. */
function ProductGridSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:mt-10 md:gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-20 rounded-full bg-paper md:w-24"
          />
        ))}
      </div>
      <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i}>
            <div className="aspect-[3/4] w-full rounded-[2rem] bg-paper" />
          </li>
        ))}
      </ul>
    </div>
  );
}

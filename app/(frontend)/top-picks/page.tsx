import type { Metadata } from "next";
import { FullBleedHero } from "@/components/home/full-bleed-hero";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TopPicksBoard } from "@/components/top-picks/top-picks-board";
import { CloudDivider } from "@/components/ui/cloud-divider";
import { JsonLd } from "@/components/seo/json-ld";
import { content } from "@/lib/content";
import { getSiteUrl } from "@/lib/seo/site-url";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import { assetUrl } from "@/lib/utils/asset-url";

const PAGE_DESCRIPTION =
  "The pack's most-loved picks — hand-picked favourites from the ScoutPaw pack: cozy apparel, calming pet supplies, playful toys, and home comforts, plus the latest popular offers.";

export const metadata: Metadata = {
  title: "Top Picks",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/top-picks" },
  openGraph: {
    title: "Top Picks — ScoutPaw TV",
    description: PAGE_DESCRIPTION,
    url: "/top-picks",
    images: [
      {
        url: assetUrl("shop/promotion.jpg"),
        alt: "ScoutPaw curated top picks — gear for pups and pet-parents",
      },
    ],
  },
};

export default async function TopPicksPage() {
  const { deal, picks } = await content.getTopPicks();

  // Breadcrumb only — NO Product/Offer schema: Top Picks are Amazon Associates
  // links and Amazon ToS forbids displaying prices without the PA-API.
  const siteUrl = getSiteUrl();
  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: `${siteUrl}/` },
    { name: "Top Picks", url: `${siteUrl}/top-picks` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* Same hero treatment as Home/Characters/Shop — keeps the site unified. */}
      <FullBleedHero
        kicker="Top Picks"
        title="The pack's most-loved picks"
        description={PAGE_DESCRIPTION}
        image={assetUrl("shop/promotion.jpg")}
        imageAlt="ScoutPaw curated top picks — favourite gear for pups and pet-parents"
      />

      <CloudDivider />

      <ScrollReveal>
        <TopPicksBoard deal={deal} picks={picks} />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <NewsletterCTA tag="top-picks-newsletter" />
      </ScrollReveal>
    </>
  );
}

import { CalmingScienceNote } from "@/components/home/calming-science-note";
import { CharacterShowcase } from "@/components/home/character-showcase";
import { FaqSection } from "@/components/home/faq-section";
import { FeatureBanner } from "@/components/home/feature-banner";
import { FeaturedPupSpotlight } from "@/components/home/featured-pup-spotlight";
import { FullBleedHero } from "@/components/home/full-bleed-hero";
import { MenuCards } from "@/components/home/menu-cards";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { VideoGrid } from "@/components/home/video-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { CloudDivider } from "@/components/ui/cloud-divider";
import { content } from "@/lib/content";
import { faqSchema } from "@/lib/seo/structured-data";
import { assetUrl } from "@/lib/utils/asset-url";

export default async function HomePage() {
  const faq = await content.getFaq();
  const faqLd = faqSchema(faq);

  return (
    <>
      {faqLd && <JsonLd data={faqLd} />}
      <FullBleedHero
        kicker="SCOUTPAW TV"
        title="Discover a happier world of puppies"
        description="Max, Rocky, and their friends have curated a calming space with soothing music and select gear, designed for your pup's happiness and relaxation"
      />

      <CloudDivider />

      <ScrollReveal>
        <MenuCards />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <FeaturedPupSpotlight />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <CharacterShowcase />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <FeatureBanner
          kicker="Shop the Pack"
          title="UNBOX THE MAGIC"
          body="Ready to bring a piece of the pack home? From high-quality dog essentials to exclusive gear for their humans, our shop is packed with treasures you won't find anywhere else."
          subDescription={'"Warning: May cause extreme tail-wagging and serious \'Add to Cart\' energy."'}
          cta="Shop the Pack"
          href="/shop"
          image={assetUrl("shop/promotion.jpg")}
          imageAlt="Featured ScoutPaw products"
        />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <VideoGrid />
      </ScrollReveal>

      <ScrollReveal>
        <CalmingScienceNote />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <FaqSection items={faq} />
      </ScrollReveal>

      <CloudDivider />

      <ScrollReveal>
        <NewsletterCTA />
      </ScrollReveal>
    </>
  );
}

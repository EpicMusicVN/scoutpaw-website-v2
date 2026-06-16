import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { Footer } from "@/components/nav/footer";
import { TopNav } from "@/components/nav/top-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { SideClouds } from "@/components/ui/side-clouds";
import { JsonLd } from "@/components/seo/json-ld";
import { content } from "@/lib/content";
import { bannerOgImage } from "@/lib/seo/og-image";
import { getSiteUrl } from "@/lib/seo/site-url";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";
import "./globals.css";

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await content.getSiteConfig();
  const siteUrl = getSiteUrl();
  const fullTitle = `${config.brand.fullName} — ${config.brand.tagline}`;
  const ogImage = bannerOgImage(fullTitle);
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: fullTitle,
      template: `%s — ${config.brand.fullName}`,
    },
    description: config.brand.description,
    applicationName: config.brand.fullName,
    authors: [{ name: config.brand.fullName, url: siteUrl }],
    creator: config.brand.fullName,
    publisher: config.brand.fullName,
    category: "Pets",
    formatDetection: { telephone: false },
    alternates: { canonical: "/" },
    openGraph: {
      title: fullTitle,
      description: config.brand.description,
      url: "/",
      siteName: config.brand.fullName,
      images: [ogImage],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: config.brand.description,
      images: [ogImage.url],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const config = await content.getSiteConfig();
  const siteUrl = getSiteUrl();
  const siteSchema = [
    organizationSchema(config, siteUrl),
    websiteSchema(config, siteUrl),
  ];
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      {/* suppressHydrationWarning on body: browser extensions (Grammarly, etc.) inject
          attributes like data-gr-ext-installed AFTER SSR but BEFORE hydration. This
          prevents the warning without affecting our own markup correctness. */}
      <body className="font-body" suppressHydrationWarning>
        <JsonLd data={siteSchema} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-semibold focus:text-white focus:shadow-md"
        >
          Skip to main content
        </a>
        <ScrollProgress />
        <SideClouds />
        <TopNav />
        <main id="main">{children}</main>
        <Footer />
        <BackToTop />
        <CookieConsent gaId={gaId} />
      </body>
    </html>
  );
}

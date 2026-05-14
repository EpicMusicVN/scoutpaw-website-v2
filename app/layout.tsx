import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { Footer } from "@/components/nav/footer";
import { TopNav } from "@/components/nav/top-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { SideClouds } from "@/components/ui/side-clouds";
import { content } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scoutpaw.vercel.app";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${config.brand.fullName} — ${config.brand.tagline}`,
      template: `%s — ${config.brand.fullName}`,
    },
    description: config.brand.description,
    openGraph: {
      title: config.brand.fullName,
      description: config.brand.description,
      images: [{ url: assetUrl("banner/banner.png") }],
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      {/* suppressHydrationWarning on body: browser extensions (Grammarly, etc.) inject
          attributes like data-gr-ext-installed AFTER SSR but BEFORE hydration. This
          prevents the warning without affecting our own markup correctness. */}
      <body className="font-body" suppressHydrationWarning>
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

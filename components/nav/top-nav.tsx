import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/nav/mobile-nav";
import { NavLinks } from "@/components/nav/nav-links";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";
import { TopNavScrollEffect } from "./top-nav-scroll-effect";

/**
 * Sticky top nav.
 * Cream-toned (matches body background) with a scroll-driven shadow so it
 * lifts off the page once the user scrolls. Logo retains its 3D warm-gold
 * drop shadow; the nav itself stays flat.
 */
export async function TopNav() {
  const config = await content.getSiteConfig();
  const characters = await content.getCharacters();
  const spotlight = characters[0]
    ? { image: assetUrl(characters[0].image), name: characters[0].name }
    : null;

  return (
    <header
      id="site-nav"
      data-scrolled="false"
      className="sticky top-0 z-30 w-full overflow-visible bg-white/70 backdrop-blur-md transform-gpu transition-all duration-300 will-change-[box-shadow,background-color] data-[scrolled=true]:bg-white/85 data-[scrolled=true]:shadow-cozy-md"
    >
      <TopNavScrollEffect />
      <nav className="relative mx-auto flex max-w-hero items-center gap-4 px-4 py-3 md:px-8 md:py-4">
        <Link
          href="/"
          className="relative flex items-center"
          aria-label={config.brand.fullName}
        >
          <Image
            src={assetUrl(config.brand.logo)}
            alt={config.brand.fullName}
            width={118}
            height={100}
            className="h-10 w-auto transition-transform duration-300 ease-out hover:scale-[1.04] md:h-12 lg:h-14"
            style={{
              filter:
                "drop-shadow(0 4px 8px rgba(184, 134, 46, 0.28)) drop-shadow(0 1px 2px rgba(43, 29, 16, 0.16))",
            }}
            priority
          />
        </Link>

        <NavLinks navItems={config.navItems} />

        <div className="ml-auto flex items-center gap-2 md:ml-0 md:gap-3">
          <Button
            href="/#newsletter"
            variant="dark"
            size="lg"
            className="hidden md:inline-flex"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            Newsletter
          </Button>
          <MobileNav
            navItems={config.navItems}
            spotlight={spotlight}
            logoText={assetUrl(config.brand.logoText)}
          />
        </div>
      </nav>
    </header>
  );
}

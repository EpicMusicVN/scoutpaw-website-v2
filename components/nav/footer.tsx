import Image from "next/image";
import Link from "next/link";
import { content } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

function SocialIcon({ platform }: { platform: string }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  } as const;
  switch (platform) {
    case "youtube":
      return (
        <svg {...props}>
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8A2.5 2.5 0 0 0 4.2 18.6c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...props} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...props}>
          <path d="M19.6 8.3a6.3 6.3 0 0 1-3.7-1.2v7.4a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .8.1v2.6a2.6 2.6 0 1 0 1.8 2.5V3h2.6a3.7 3.7 0 0 0 3.7 3.7v1.6z" />
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <path d="M17.5 3h3.3l-7.2 8.2L22 21h-6.6l-5.2-6.7L4.3 21H1l7.7-8.8L1.5 3h6.7l4.7 6.1L17.5 3zm-1.2 16.2h1.8L7.7 4.7H5.8l10.5 14.5z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...props}>
          <path d="M22 12a10 10 0 1 0-11.5 9.9V14.9H8v-2.9h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z" />
        </svg>
      );
    default:
      return null;
  }
}

export async function Footer() {
  const config = await content.getSiteConfig();
  const year = new Date().getFullYear();

  const exploreLinks = (config.footerExplore ?? config.navItems).map((item) => ({
    label: item.label,
    href: item.href,
  }));

  const realSocial = config.social.filter((s) => !s.url.startsWith("TODO"));

  return (
    <footer>
      <div className="relative bg-navy py-14 text-white/90 md:py-16">
        {/* Subtle darker gradient overlay lifts white-text contrast above 7:1 on the
            lighter #397fc5 base. Sits behind content via z-0 / content via relative. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/20"
        />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-14">
            <div>
              <Image
                src={assetUrl(config.brand.logoText)}
                alt={config.brand.fullName}
                width={222}
                height={50}
                className="h-8 w-auto [filter:drop-shadow(0_0_12px_rgba(255,215,12,0.5))_drop-shadow(0_2px_6px_rgba(255,215,12,0.35))] md:h-10 lg:h-12"
              />
              <p className="mt-4 max-w-xs text-sm text-white/80 md:text-base">
                {config.brand.description}
              </p>
            </div>

            <nav aria-label="Footer">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#fffbe6] md:text-sm">
                Explore
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm md:text-base">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/85 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#fffbe6] md:text-sm">
                Follow the pack
              </h3>
              {realSocial.length === 0 ? (
                <p className="mt-4 text-sm italic text-white/60">Social links coming soon</p>
              ) : (
                <ul className="mt-4 flex flex-wrap items-center gap-3">
                  {realSocial.map((s) => (
                    <li key={s.platform}>
                      <Link
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${config.brand.name} on ${s.label}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary hover:text-ink"
                      >
                        <SocialIcon platform={s.platform} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/65 md:text-sm">
            &copy; {year} {config.brand.fullName}. {config.brand.tagline}.
          </div>
        </div>
      </div>
    </footer>
  );
}


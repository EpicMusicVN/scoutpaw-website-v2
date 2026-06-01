"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const STORAGE_KEY = "scoutpaw.consent.v1";

type Consent = "accepted" | "declined" | null;

function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "declined" ? v : null;
}

export function CookieConsent({ gaId }: { gaId: string | undefined }) {
  const [consent, setConsent] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setConsent(readConsent());
  }, []);

  const persist = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  const showBanner = hydrated && consent === null;
  const loadGa = hydrated && consent === "accepted" && Boolean(gaId);

  return (
    <>
      {loadGa && gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {showBanner && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-2 z-50 mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-ink/95 p-3 text-sm text-cream shadow-2xl backdrop-blur md:inset-x-4 md:bottom-4 md:gap-6 md:p-6"
        >
          {/* Responsive copy: short on mobile (denser footprint), full on md+
              so the brand voice survives where space allows. */}
          <p className="flex-1">
            <span className="md:hidden">
              ScoutPaw uses cookies for analytics. OK with you?
            </span>
            <span className="hidden md:inline">
              ScoutPaw uses cookies for anonymous analytics so we can keep making
              things our pack loves. OK with you?
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => persist("declined")}
              className="inline-flex min-h-[44px] items-center rounded-full px-4 text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => persist("accepted")}
              className="inline-flex min-h-[44px] items-center rounded-full bg-brand-primary px-5 font-semibold text-ink-blue transition-all hover:brightness-95 active:scale-[0.98]"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

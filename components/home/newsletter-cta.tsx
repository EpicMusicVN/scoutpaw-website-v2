"use client";

import Image from "next/image";
import { useState } from "react";
import { PawIcon } from "@/components/ui/paw-icon";
import { track } from "@/lib/analytics/track";
import { assetUrl } from "@/lib/utils/asset-url";

type State = "idle" | "submitting" | "success" | "error";

/**
 * Join the Pack — community newsletter CTA.
 * Full-bleed honey gradient, oversized form, social-proof line, and small
 * paw-print decoratives at the corners. Lives at #newsletter so the navbar
 * "Join the Newsletter" button can scroll to it.
 */
export function NewsletterCTA({
  tag = "home-newsletter",
  heading = "Become a VIP",
  subheading = 'Get a front-row seat to the pack! We\'ll send new episodes, cozy activities, and the occasional "digital treat" straight to your inbox. No barks, no spam, just love.',
  socialProof = "Already 20,000+ pet parents in our family!",
  footerSlot,
}: {
  tag?: string;
  heading?: string;
  subheading?: string;
  socialProof?: string;
  // Optional element rendered inside the honey gradient below the social-proof
  // line. Used by coming-soon pages to keep their "Back to home" button on the
  // honey backdrop so it doesn't float on cream above the footer.
  footerSlot?: React.ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tag, hp }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Something went wrong.");
      }
      setState("success");
      setEmail("");
      const eventName = tag.startsWith("coming-soon-") ? "ComingSoonSubmit" : "NewsletterSubmit";
      track(eventName, { tag });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const errorId = "newsletter-error";

  return (
    <section
      id="newsletter"
      className="relative mx-auto max-w-3xl scroll-mt-24 px-4 pt-4 pb-56 md:px-8 md:pt-4 md:pb-72"
    >
      {/* Card + character poses share this relative wrapper so the poses can
          anchor to the card's bottom edge (bottom-0 = card bottom) and use
          translate-y-1/2 for the 50% overlap / 50% hang-off look. */}
      <div className="relative">
      <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-surface px-6 py-10 text-center shadow-cozy-md md:px-12 md:py-14">
        <CornerPaws />

        <div className="relative">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cobalt md:text-sm">
            Join the Pack
          </p>
          <h2 className="mt-3 font-display text-5xl font-bold leading-[0.98] heading-sticker-honey md:text-6xl lg:text-7xl">
            {heading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-blue/85 md:text-lg lg:text-xl">
            {subheading}
          </p>

          {state === "success" ? (
            <p
              role="status"
              aria-live="polite"
              className="mt-10 font-display text-xl text-ink-blue md:text-2xl"
            >
              You&apos;re on the list. Welcome to the pack. 🐾
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-10 flex max-w-xl flex-col gap-3"
              noValidate
            >
              {/* Honeypot — off-screen rather than display:none so tuned bots
                  that skip hidden fields still fill it. */}
              <input
                type="text"
                name="hp"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address (required)
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={state === "error"}
                  aria-describedby={state === "error" ? errorId : undefined}
                  className="min-h-[56px] flex-1 rounded-full border-[1.5px] border-ink/20 bg-surface px-6 text-base text-ink-blue placeholder:text-ink-blue/55 focus:border-ink/45 focus:outline-none md:text-lg"
                  disabled={state === "submitting"}
                />
                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="cta-shimmer inline-flex min-h-[56px] items-center justify-center rounded-full bg-ink px-8 font-display text-lg font-bold text-surface shadow-cozy-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cozy-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {state === "submitting" ? (
                    <>
                      <Spinner />
                      Sending
                    </>
                  ) : (
                    "Join the Pack"
                  )}
                </button>
              </div>

              <p
                id={errorId}
                role="alert"
                aria-live="polite"
                className="min-h-[1.25rem] text-left text-sm text-ink-blue/85"
              >
                {state === "error" && error ? `${error} Please try again.` : ""}
              </p>
            </form>
          )}

          <p className="mt-6 font-display text-sm text-ink-blue/70 md:text-base">
            {socialProof}
          </p>

          {footerSlot && (
            <div className="mt-8 flex justify-center">{footerSlot}</div>
          )}
        </div>
      </div>

      {/* Character pose decoratives — anchored to the card's bottom-left and
          bottom-right corners. Poses sit ON the card (no translate-y / no
          overhang below) and extend upward from each corner. Slight rotation
          adds personality without breaking the corner alignment. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden lg:block"
      >
        <Image
          src={assetUrl("characters-position/golden1.png")}
          alt=""
          width={900}
          height={1200}
          className="absolute left-0 bottom-0 h-auto w-80 translate-y-1/2 -rotate-6 origin-bottom-left"
        />
        <Image
          src={assetUrl("characters-position/husky2.png")}
          alt=""
          width={900}
          height={1200}
          className="absolute right-0 bottom-0 h-auto w-80 translate-y-1/2 rotate-6 origin-bottom-right"
        />
      </div>
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className="mr-2 animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

/**
 * Tiny paw-print decoratives in each corner. Pure CSS / SVG, no animation.
 */
function CornerPaws() {
  const Paw = ({ className }: { className: string }) => (
    <PawIcon
      className={`absolute h-12 w-12 text-ink-blue/15 md:h-16 md:w-16 ${className}`}
    />
  );

  return (
    <>
      <Paw className="left-6 top-8 -rotate-12 md:left-12 md:top-12" />
      <Paw className="right-8 top-12 rotate-12 md:right-16 md:top-16" />
      <Paw className="bottom-10 left-10 rotate-45 md:bottom-16 md:left-20" />
      <Paw className="bottom-8 right-6 -rotate-12 md:bottom-12 md:right-12" />
    </>
  );
}

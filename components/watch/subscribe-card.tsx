import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/lib/utils/asset-url";

export function SubscribeCard({ youtubeUrl }: { youtubeUrl: string }) {
  return (
    <section className="relative mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <div className="relative rounded-[2rem] border border-ink/10 bg-surface px-6 py-10 text-center shadow-sm md:px-12 md:py-14">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-navy/85 md:text-sm">
          Stay tuned
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
          Subscribe to ScoutPaw on YouTube
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ink/85 md:text-lg">
          Tap the bell to hear when new episodes drop into your pup&apos;s rotation.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-navy px-7 py-3 font-display text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <YouTubeMark />
            Subscribe
          </Link>
        </div>
      </div>

      {/* Character pose decoratives — peek from below the card edges. Hidden
          on mobile to avoid horizontal overflow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
      >
        <Image
          src={assetUrl("characters-position/corgi1.png")}
          alt=""
          width={320}
          height={180}
          className="absolute bottom-2 -left-14 h-auto w-64 -rotate-4"
        />
        <Image
          src={assetUrl("characters-position/collie1.png")}
          alt=""
          width={320}
          height={180}
          className="absolute bottom-4 -right-14 h-auto w-64 rotate-4"
        />
      </div>
    </section>
  );
}

function YouTubeMark() {
  return (
    <svg width="24" height="17" viewBox="0 0 28 20" aria-hidden="true">
      <rect x="0" y="0" width="28" height="20" rx="5" fill="#FF0000" />
      <path d="M11 6 L11 14 L18 10 Z" fill="#ffffff" />
    </svg>
  );
}

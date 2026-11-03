import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Help with the ScoutPaw TV apps: contact our team, supported devices, playback tips, and answers to common questions.",
  alternates: { canonical: "/support" },
};

const SUPPORT_EMAIL = "admin@scoutpaw.tv";
const WATCH_URL = "https://watch.scoutpaw.tv";

const linkClass =
  "font-semibold text-cobalt underline underline-offset-2 hover:text-ink-blue";

const DEVICES = [
  "Apple TV",
  "iPhone",
  "Android TV and Google TV",
  "Android phones",
  "Amazon Fire TV",
  "Roku",
  "Samsung and LG smart TVs",
];

type FaqItem = { question: string; answer: ReactNode };

const FAQ: FaqItem[] = [
  {
    question: "Which devices can I use?",
    answer: (
      <>
        <p>
          ScoutPaw TV is built for these devices. Some apps are available now and others are
          coming soon:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {DEVICES.map((device) => (
            <li key={device}>{device}</li>
          ))}
        </ul>
        <p className="mt-2">
          You can also watch in any web browser at{" "}
          <a href={WATCH_URL} className={linkClass}>
            watch.scoutpaw.tv
          </a>
          .
        </p>
      </>
    ),
  },
  {
    question: "Is ScoutPaw TV free?",
    answer: (
      <p>
        Yes. ScoutPaw TV is free to watch, and you don&apos;t need an account or sign-in. Just
        open the app and press play.
      </p>
    ),
  },
  {
    question: "A video won't play or keeps stopping. What can I do?",
    answer: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Check that your device is connected to the internet and the connection is steady.</li>
        <li>Close the app completely and open it again.</li>
        <li>Make sure you have the latest version of the app from your device&apos;s app store.</li>
      </ul>
    ),
  },
  {
    question: "How do I leave the TV on for my dog?",
    answer: (
      <>
        <p>
          Videos play one after another, so you can start one and let it run. On the TV apps,
          choose <strong>Dog Mode</strong> to keep videos playing in a loop, and set a sleep timer
          in the player if you want playback to stop on its own.
        </p>
        <p className="mt-2">
          Before you head out, keep the volume at a comfortable level, place the TV where your dog
          can&apos;t knock it over, and tuck away any loose cables.
        </p>
      </>
    ),
  },
  {
    question: "What about my privacy?",
    answer: (
      <p>
        You can read how we handle data in our{" "}
        <Link href="/privacy" className={linkClass}>
          Privacy Policy
        </Link>
        .
      </p>
    ),
  },
  {
    question: "How do I report a problem?",
    answer: (
      <p>
        Email us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
          {SUPPORT_EMAIL}
        </a>
        . Please tell us your device model (for example, &ldquo;Apple TV 4K&rdquo; or
        &ldquo;Samsung TV&rdquo;), the app version, and what happened. The app version is
        usually shown in the app&apos;s Settings or in your device&apos;s app settings.
      </p>
    ),
  },
];

export default function SupportPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
      <div className="rounded-[2rem] bg-surface p-8 shadow-sticker md:p-12">
        <h1 className="font-display text-4xl font-bold uppercase text-ink-blue md:text-5xl">
          Support
        </h1>
        <p className="mt-4 text-ink-blue/85">
          Need a hand with the ScoutPaw TV apps? We&apos;re happy to help.
        </p>

        <section aria-labelledby="support-contact" className="mt-10">
          <h2
            id="support-contact"
            className="font-display text-2xl font-bold text-ink-blue md:text-3xl"
          >
            Contact us
          </h2>
          <p className="mt-3 text-ink-blue/85">
            Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
              {SUPPORT_EMAIL}
            </a>
            . We usually reply within 2 business days.
          </p>
        </section>

        <section aria-labelledby="support-faq" className="mt-10">
          <h2
            id="support-faq"
            className="font-display text-2xl font-bold text-ink-blue md:text-3xl"
          >
            Common questions
          </h2>
          <div className="mt-4 space-y-6">
            {FAQ.map((item) => (
              <div key={item.question}>
                <h3 className="font-display text-lg font-semibold text-ink-blue md:text-xl">
                  {item.question}
                </h3>
                <div className="mt-2 text-ink-blue/85">{item.answer}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-ink-blue/10 pt-6 text-sm text-ink-blue/70">
          <p>ScoutPaw is a product of Rockwater Group Inc.</p>
          <p className="mt-1">&copy; 2026 Rockwater Group Inc.</p>
        </footer>
      </div>
    </article>
  );
}

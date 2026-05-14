import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "ScoutPaw privacy policy.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
      <div className="rounded-[2rem] bg-surface p-8 shadow-sticker md:p-12">
        <h1 className="font-display text-4xl font-bold uppercase text-ink md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-ink/85">
          A real privacy policy is on the way. ScoutPaw collects email addresses for
          newsletter sign-ups and uses anonymous analytics to improve the site. We do not
          sell your data.
        </p>
        <p className="mt-3 italic text-ink/70">
          This is a placeholder page. Production-ready legal copy is required before public launch.
        </p>
      </div>
    </article>
  );
}

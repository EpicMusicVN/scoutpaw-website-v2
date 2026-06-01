import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "ScoutPaw terms of use.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
      <div className="rounded-[2rem] bg-surface p-8 shadow-sticker md:p-12">
        <h1 className="font-display text-4xl font-bold uppercase text-ink-blue md:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-ink-blue/85">
          Real terms of use are on the way. Use of this site implies basic respect for
          our characters, our pack, and other visitors. Be kind.
        </p>
        <p className="mt-3 italic text-ink-blue/70">
          This is a placeholder page. Production-ready legal copy is required before public launch.
        </p>
      </div>
    </article>
  );
}

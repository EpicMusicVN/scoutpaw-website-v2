import type { FaqItem } from "@/lib/content";

/**
 * FAQ accordion. Uses native <details>/<summary> so it's fully keyboard- and
 * screen-reader-accessible with zero client JS (server component). Pairs with
 * FAQPage JSON-LD injected by the page for AEO/voice-search visibility.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="faq"
      className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 md:px-8 md:py-28"
    >
      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cobalt md:text-sm">
          Good to Know
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold heading-sticker-honey md:text-5xl lg:text-6xl">
          Frequently Asked Questions
        </h2>
      </header>

      <div className="mt-12 flex flex-col gap-4">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-3xl border border-ink/10 bg-surface px-6 py-5 shadow-cozy-md md:px-8"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-ink-blue md:text-xl">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-2xl text-cobalt transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-4 text-base leading-relaxed text-ink-blue/85 md:text-lg">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

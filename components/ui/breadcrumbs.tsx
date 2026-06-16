import Link from "next/link";

export type Crumb = { name: string; href: string };

/**
 * Accessible breadcrumb trail (server component, zero client JS). The same
 * `items` array also feeds `breadcrumbSchema` at the call site, so the visible
 * trail and the BreadcrumbList structured data can never drift. The last crumb
 * is the current page — rendered as text with `aria-current`, not a link.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-hero px-4 pt-6 md:px-8"
    >
      <ol className="flex flex-wrap items-center gap-1.5 font-display text-sm text-ink-blue/70">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="font-semibold text-ink-blue">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-cobalt">
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-ink-blue/40">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import { type ReactNode } from "react";

/**
 * Shared pill-shaped filter chip. Toggle-button semantics (`aria-pressed`);
 * the owning section supplies the `role="group"` wrapper. Used by the Watch
 * Explore Videos section and the Top Picks board.
 *
 * Client Component: it attaches an `onClick` DOM handler, so it cannot be a
 * Server Component even though it holds no state of its own.
 */
export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center rounded-full px-4 font-display text-sm font-semibold transition-all duration-150 md:px-5 md:text-base ${
        active
          ? "bg-ink text-surface shadow-sm"
          : "bg-surface text-ink-blue/85 hover:bg-brand-primary/30 hover:text-ink-blue"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper`}
    >
      {children}
    </button>
  );
}

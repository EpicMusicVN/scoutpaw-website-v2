"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/content";
import { cn } from "@/lib/utils/cn";

/**
 * Desktop nav link list. Ink text on glass nav, ink underline on hover/active
 * via the `.nav-underline` utility (defined in `globals.css`).
 */
export function NavLinks({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <ul className="hidden flex-1 items-center justify-center gap-1 md:flex md:gap-2">
      {navItems
        .filter((i) => i.href !== "/")
        .map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
                className={cn(
                  "nav-underline relative inline-flex min-h-[44px] items-center rounded-full px-4 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors duration-200 md:px-5 md:text-base",
                  active
                    ? "text-ink"
                    : item.enabled
                      ? "text-ink hover:text-ink"
                      : "text-ink/45 hover:text-ink/70",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
    </ul>
  );
}

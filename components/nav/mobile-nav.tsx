"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Character, NavItem } from "@/lib/content";
import { cn } from "@/lib/utils/cn";

/**
 * Hamburger trigger + full-screen overlay menu (mobile only).
 * 48px tap target, animated burger ↔ X. Body scroll-locked while open.
 * ESC closes. Auto-closes on route change.
 *
 * Drawer is rendered via React Portal directly to `document.body` so it
 * escapes TopNav's stacking context (TopNav's `backdrop-blur-md` creates a
 * stacking context that would otherwise trap the drawer's z-index).
 */
export function MobileNav({
  navItems,
  spotlight,
  logoText,
}: {
  navItems: NavItem[];
  spotlight?: Pick<Character, "image" | "name"> | null;
  logoText: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Mount gate for SSR safety — `document` is only available client-side.
  useEffect(() => setMounted(true), []);

  // Auto-close drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      document.body.classList.remove("nav-locked");
      return;
    }
    document.body.classList.add("nav-locked");
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const drawer = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-white/95 backdrop-blur-md md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <Image
              src={logoText}
              alt="ScoutPaw"
              width={200}
              height={64}
              className="h-10 w-auto [filter:drop-shadow(0_2px_6px_rgba(43,29,16,0.25))]"
            />
            <button
              ref={closeBtnRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-ink/10"
            >
              <BurgerIcon open />
            </button>
          </div>

          <motion.nav
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex-1 overflow-y-auto px-6 py-4"
            aria-label="Primary"
          >
            <ul className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl px-4 py-4 font-display text-2xl font-bold uppercase tracking-wide transition-colors",
                        active
                          ? "bg-brand-primary text-ink shadow-cozy"
                          : item.enabled
                            ? "text-ink hover:bg-ink/5"
                            : "text-ink/45 hover:bg-ink/5 hover:text-ink/65",
                      )}
                    >
                      <span>{item.label}</span>
                      {active && (
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full bg-ink"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-6">
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="cta-shimmer inline-flex min-h-[56px] items-center justify-center rounded-full bg-brand-primary px-6 font-display text-lg font-bold text-ink shadow-cozy"
              >
                Shop the Pack
              </Link>
              <Link
                href="/#newsletter"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border-[1.5px] border-ink/20 bg-surface px-6 font-display text-lg font-bold text-ink"
              >
                Join the Newsletter
              </Link>
            </div>
          </motion.nav>

          {spotlight && (
            <div className="pointer-events-none relative h-40 w-full overflow-hidden">
              <Image
                src={spotlight.image}
                alt=""
                fill
                sizes="100vw"
                className="object-contain object-bottom"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-ink/5 active:scale-95 md:hidden"
      >
        <BurgerIcon open={open} />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}

/**
 * Animated burger ↔ X. Two motion paths, no extra deps.
 */
function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.path
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={open ? { d: "M6 6L18 18" } : { d: "M4 7L20 7" }}
        transition={{ duration: 0.25 }}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={open ? { opacity: 0 } : { opacity: 1, d: "M4 12L20 12" }}
        transition={{ duration: 0.15 }}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={open ? { d: "M6 18L18 6" } : { d: "M4 17L20 17" }}
        transition={{ duration: 0.25 }}
      />
    </svg>
  );
}

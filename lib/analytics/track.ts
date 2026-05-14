/**
 * SSR-safe event tracker. No-op until GA4 is loaded (post-consent).
 * Components call track('BuyNowClick', { product: handle }) — typed events list
 * grows as instrumentation expands.
 */
type EventName = "BuyNowClick" | "NewsletterSubmit" | "ComingSoonSubmit" | "VideoOpen";

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function track(name: EventName, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

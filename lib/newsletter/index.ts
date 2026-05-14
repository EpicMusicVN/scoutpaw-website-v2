import { subscribeConvertKit } from "./convertkit-source";
import type { NewsletterRequest, NewsletterResult } from "./schemas";
import { subscribeStub } from "./stub-source";

export async function subscribe(req: NewsletterRequest): Promise<NewsletterResult> {
  const mode = process.env.NEWSLETTER_MODE ?? "stub";
  if (mode === "live") return subscribeConvertKit(req);
  return subscribeStub(req);
}

export { NewsletterRequestSchema } from "./schemas";
export type { NewsletterRequest, NewsletterResult } from "./schemas";

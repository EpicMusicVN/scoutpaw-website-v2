import { subscribeResend } from "./resend-source";
import type { NewsletterRequest, NewsletterResult } from "./schemas";
import { subscribeStub } from "./stub-source";

export async function subscribe(req: NewsletterRequest): Promise<NewsletterResult> {
  const mode = process.env.NEWSLETTER_MODE ?? "stub";
  console.info("[newsletter] dispatch", {
    mode,
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasTeamEmail: !!process.env.TEAM_NOTIFICATION_EMAIL,
  });
  if (mode === "live") return subscribeResend(req);
  return subscribeStub(req);
}

export { NewsletterRequestSchema } from "./schemas";
export type { NewsletterRequest, NewsletterResult } from "./schemas";

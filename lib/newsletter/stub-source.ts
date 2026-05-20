import type { NewsletterRequest, NewsletterResult } from "./schemas";

/**
 * MVP mode. Logs the payload to the server console — useful for verifying
 * forms work end-to-end before the real Resend account is provisioned.
 */
export async function subscribeStub(req: NewsletterRequest): Promise<NewsletterResult> {
  console.log("[newsletter:stub] would subscribe:", {
    email: req.email,
    tag: req.tag ?? null,
  });
  return { ok: true };
}

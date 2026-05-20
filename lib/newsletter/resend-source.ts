import { Resend } from "resend";
import { maskEmail } from "./mask";
import type { NewsletterRequest, NewsletterResult } from "./schemas";

/**
 * Live mode. Sends a transactional notification to the team inbox via Resend
 * each time a user subscribes via the "Join the Pack" form. The subscriber
 * itself does not receive an email — this is internal notification only.
 */
export async function subscribeResend(
  req: NewsletterRequest,
): Promise<NewsletterResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEAM_NOTIFICATION_EMAIL;
  const from = process.env.NEWSLETTER_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.error("[newsletter:resend] config missing", {
      hasApiKey: !!apiKey,
      hasRecipient: !!to,
    });
    return {
      ok: false,
      error: "Newsletter is not configured. Please try again later.",
    };
  }

  const resend = new Resend(apiKey);
  const timestamp = new Date().toISOString();
  const tag = req.tag ?? "(none)";
  const safeEmail = escapeHtml(req.email);
  const safeTag = escapeHtml(tag);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `New ScoutPaw subscriber: ${req.email}`,
      text: [
        "A new user has subscribed on the ScoutPaw website.",
        "",
        `Email: ${req.email}`,
        `Source tag: ${tag}`,
        `Timestamp: ${timestamp}`,
      ].join("\n"),
      html: [
        "<p>A new user has subscribed on the ScoutPaw website.</p>",
        "<ul>",
        `  <li><strong>Email:</strong> ${safeEmail}</li>`,
        `  <li><strong>Source tag:</strong> ${safeTag}</li>`,
        `  <li><strong>Timestamp:</strong> ${timestamp}</li>`,
        "</ul>",
      ].join("\n"),
    });

    if (error) {
      console.error("[newsletter:resend] send error", {
        name: error.name,
        message: error.message,
        toMasked: maskEmail(to),
      });
      return { ok: false, error: "Subscription failed. Please try again." };
    }
    console.info("[newsletter:resend] sent ok", {
      id: data?.id,
      toMasked: maskEmail(to),
    });
    return { ok: true };
  } catch (err) {
    console.error("[newsletter:resend] fetch error", {
      err: err instanceof Error ? err.message : String(err),
      toMasked: maskEmail(to),
    });
    return { ok: false, error: "Subscription failed. Please try again." };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

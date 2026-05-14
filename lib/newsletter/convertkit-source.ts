import type { NewsletterRequest, NewsletterResult } from "./schemas";

/**
 * Live mode. Subscribes via ConvertKit v3 forms API. Tags are passed through
 * so coming-soon-{slug} signups stay segmentable.
 */
export async function subscribeConvertKit(
  req: NewsletterRequest,
): Promise<NewsletterResult> {
  const apiKey = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;

  if (!apiKey || !formId) {
    return {
      ok: false,
      error: "Newsletter is not configured. Please try again later.",
    };
  }

  try {
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          email: req.email,
          tags: req.tag ? [req.tag] : undefined,
        }),
      },
    );
    if (!res.ok) {
      console.error("[newsletter:convertkit] non-2xx:", res.status);
      return { ok: false, error: "Subscription failed. Please try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[newsletter:convertkit] fetch error:", err);
    return { ok: false, error: "Subscription failed. Please try again." };
  }
}

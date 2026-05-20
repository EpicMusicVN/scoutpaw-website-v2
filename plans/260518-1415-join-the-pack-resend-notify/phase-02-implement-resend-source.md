---
phase: 2
title: Implement Resend source
status: completed
priority: P1
effort: 30m
dependencies:
  - 1
---

# Phase 2: Implement Resend source

## Overview

Create `lib/newsletter/resend-source.ts` mirroring the `convertkit-source.ts` shape. Wire it into `lib/newsletter/index.ts` so `NEWSLETTER_MODE=live` routes to Resend.

## Requirements

- Functional:
  - Accepts `NewsletterRequest` ({ email, tag?, hp? }) — same shape as before
  - Returns `NewsletterResult` ({ ok: true } | { ok: false, error })
  - Sends one transactional email per call to `TEAM_NOTIFICATION_EMAIL`
  - Includes subscriber email, tag, ISO timestamp in body
- Non-functional:
  - Server-side only (file runs in Node runtime per `route.ts: runtime = "nodejs"`)
  - Misconfigured env (no API key / no recipient) returns clean error, doesn't crash
  - No PII logged in success path; errors log status only

## Architecture

```
lib/newsletter/
├── index.ts              ← dispatch by NEWSLETTER_MODE
├── resend-source.ts      ← NEW: calls Resend SDK
├── stub-source.ts        ← unchanged: console.log
├── schemas.ts            ← unchanged
├── rate-limit.ts         ← unchanged
└── convertkit-source.ts  ← deleted in Phase 3
```

### Data Flow

```
POST /api/newsletter
  → parse + zod validate + honeypot + rate-limit (existing)
  → subscribe(req)              [index.ts]
      → if mode === "live" → subscribeResend(req)
          → Resend.emails.send({ from, to, subject, html, text })
          → return { ok: true } | { ok: false, error }
```

## Related Code Files

- Create: `lib/newsletter/resend-source.ts`
- Modify: `lib/newsletter/index.ts` (swap convertkit import → resend)

## Implementation Steps

1. **Create `lib/newsletter/resend-source.ts`:**

   ```typescript
   import { Resend } from "resend";
   import type { NewsletterRequest, NewsletterResult } from "./schemas";

   /**
    * Live mode. Sends a transactional notification to the team inbox via Resend
    * each time a user subscribes via the "Join the Pack" form.
    */
   export async function subscribeResend(
     req: NewsletterRequest,
   ): Promise<NewsletterResult> {
     const apiKey = process.env.RESEND_API_KEY;
     const to = process.env.TEAM_NOTIFICATION_EMAIL;
     const from = process.env.NEWSLETTER_FROM_EMAIL ?? "onboarding@resend.dev";

     if (!apiKey || !to) {
       return {
         ok: false,
         error: "Newsletter is not configured. Please try again later.",
       };
     }

     const resend = new Resend(apiKey);
     const timestamp = new Date().toISOString();
     const tag = req.tag ?? "(none)";

     try {
       const { error } = await resend.emails.send({
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
         html: `
           <p>A new user has subscribed on the ScoutPaw website.</p>
           <ul>
             <li><strong>Email:</strong> ${escapeHtml(req.email)}</li>
             <li><strong>Source tag:</strong> ${escapeHtml(tag)}</li>
             <li><strong>Timestamp:</strong> ${timestamp}</li>
           </ul>
         `,
       });

       if (error) {
         console.error("[newsletter:resend] send error:", error.name, error.message);
         return { ok: false, error: "Subscription failed. Please try again." };
       }
       return { ok: true };
     } catch (err) {
       console.error("[newsletter:resend] fetch error:", err);
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
   ```

2. **Update `lib/newsletter/index.ts`:**

   ```typescript
   import { subscribeResend } from "./resend-source";
   import type { NewsletterRequest, NewsletterResult } from "./schemas";
   import { subscribeStub } from "./stub-source";

   export async function subscribe(req: NewsletterRequest): Promise<NewsletterResult> {
     const mode = process.env.NEWSLETTER_MODE ?? "stub";
     if (mode === "live") return subscribeResend(req);
     return subscribeStub(req);
   }

   export { NewsletterRequestSchema } from "./schemas";
   export type { NewsletterRequest, NewsletterResult } from "./schemas";
   ```

3. **Verify import resolves** — `pnpm typecheck` after edits, before moving to Phase 3.

## Success Criteria

- [ ] `lib/newsletter/resend-source.ts` exports `subscribeResend`
- [ ] `lib/newsletter/index.ts` dispatches `live` → `subscribeResend`
- [ ] `pnpm typecheck` passes
- [ ] HTML body XSS-safe (subscriber email is escaped)
- [ ] Missing env vars produce `{ ok: false, error }` — never throw

## Risk Assessment

- **Risk:** Subscriber email rendered raw in HTML → injection vector
  - **Mitigation:** `escapeHtml` helper applied to all user-controlled strings in HTML body. Zod already validates email format.
- **Risk:** Resend API key leak via error logs
  - **Mitigation:** Only log `error.name` + `error.message`; never log full SDK response or env.
- **Risk:** Email subject reveals subscriber address in monitoring/log aggregators
  - **Mitigation:** Acceptable — internal-only inbox, same address is in body. Document for ops.

## Security Considerations

- HTML escaping on all user-controlled fields (email, tag)
- API key strictly server-side; never in browser bundle
- Honeypot + rate-limit upstream (existing) prevents abuse

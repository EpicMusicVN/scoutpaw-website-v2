# Brainstorm — Join the Pack: Resend-based Team Notification

**Date:** 2026-05-18 14:15 (Asia/Saigon)
**Branch:** main
**Scope:** Replace ConvertKit integration with a free email service; send team notification on every "Join the Pack" signup.

---

## Problem Statement

The "Join the Pack" newsletter form (`#newsletter` section) collects emails via `POST /api/newsletter` and currently routes to either:
- `stub` mode — logs to server console (current default)
- `live` mode — ConvertKit v3 forms API (never provisioned)

Requirements:
- Replace with **free, simple, easy-to-maintain** email service
- On every signup, send **team notification email** containing subscriber's email + confirmation message
- Notification fires **first** (before any downstream subscriber storage — but no subscriber storage is required for now)

---

## Decisions Locked (User-Confirmed)

| Decision | Value |
|---|---|
| ConvertKit fate | Replace entirely |
| Subscriber email | None — team notification only |
| Volume | <100 signups/month |
| Team destination | Single inbox (user-provided address) |
| Service | **Resend** (Approach A) |
| Sender | `onboarding@resend.dev` initially; verified domain post-launch (optional upgrade) |
| Routing | Single team inbox for all tags |

---

## Approaches Evaluated

### A. Resend — **CHOSEN**

- Free tier: 3,000 emails/mo, 100/day (30× projected volume)
- Native Vercel integration
- Clean Node SDK (`resend`)
- Sender = `onboarding@resend.dev` requires zero DNS config; only delivers to the Resend-account-owner's email — perfect alignment with team-notification-only goal
- Pros: minimal code, robust deliverability, future-proof for subscriber emails
- Cons: requires Resend account + API key

### B. Web3Forms / Formspree

- Free 250 submissions/mo
- Outsources entire send pipeline
- Bypasses existing server-side validation + rate-limit + honeypot
- Vendor lock-in; can't easily extend to subscriber welcome emails
- Rejected — too inflexible

### C. Nodemailer + Gmail App Password

- $0, no third party
- Gmail flags serverless-origin SMTP; deliverability brittle on Vercel
- 2FA + app-password rotation maintenance burden
- Rejected — fragile in production

---

## Final Recommended Solution

**Resend transactional email**, sending team notification from a server-side route handler.

### Architecture

```
[ User Form ]
     │ POST /api/newsletter { email, tag, hp }
     ▼
[ /api/newsletter route ]
   ├── parse + zod validate
   ├── honeypot check
   ├── rate limit
   └── subscribe()  ─────►  resend-source.ts
                            └── Resend API: emails.send()
                                from: NEWSLETTER_FROM_EMAIL
                                to:   TEAM_NOTIFICATION_EMAIL
                                subject: "New ScoutPaw subscriber: {email}"
                                html:  subscriber email + tag + timestamp
```

### File Changes

| Path | Action |
|---|---|
| `lib/newsletter/resend-source.ts` | **create** — calls Resend SDK, sends team notification |
| `lib/newsletter/index.ts` | **update** — swap ConvertKit import → Resend |
| `lib/newsletter/convertkit-source.ts` | **delete** |
| `.env.local.example` | **update** — remove `CONVERTKIT_*`, add `RESEND_API_KEY`, `TEAM_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM_EMAIL` |
| `docs/deployment.md` | **update** — env var table + post-deploy smoke test |
| `package.json` | **update** — add `resend` dependency |

### Environment Variables

| Var | Example | Purpose |
|---|---|---|
| `NEWSLETTER_MODE` | `live` \| `stub` | Existing toggle — preserved |
| `RESEND_API_KEY` | `re_xxx` | From Resend dashboard |
| `TEAM_NOTIFICATION_EMAIL` | `team@scoutpaw.tv` | Where notifications go |
| `NEWSLETTER_FROM_EMAIL` | `onboarding@resend.dev` (initial) | Sender; swap to verified domain later |

### Email Template (Plain-Text + HTML)

- **Subject:** `New ScoutPaw subscriber: {email}`
- **Body:**
  - "A new user has subscribed on the ScoutPaw website."
  - Subscriber email: `{email}`
  - Source tag: `{tag}` (so coming-soon vs home is distinguishable)
  - Timestamp: ISO 8601

### Behavior Preserved

- Stub mode still logs to console (no Resend call) — useful for dev without API key
- Rate limit + honeypot + Zod schema validation untouched
- API contract `{ ok: true } | { ok: false, error: string }` unchanged
- Form UX unchanged

---

## Implementation Considerations & Risks

| Risk | Mitigation |
|---|---|
| Resend API outage → signups silently fail | Return `{ ok: false }` with generic error → user sees retry message; log error server-side |
| `onboarding@resend.dev` only delivers to account owner | Acceptable for team-notification-only; document domain-verification upgrade path |
| Future: want subscriber storage | Add list-management service (Resend Audiences, Mailchimp, Loops) later — current code stays as transactional notification layer |
| API key leak | Server-side only (`process.env.RESEND_API_KEY`); never `NEXT_PUBLIC_` |
| Spam / abuse | Existing rate-limit (`rate-limit.ts`) + honeypot already in place |

---

## Success Metrics

- ✅ Submit form on staging → team inbox receives notification within 5s
- ✅ Notification contains subscriber email + tag + timestamp
- ✅ Form returns `{ ok: true }` on success
- ✅ Form returns clean error on Resend API failure (e.g., bad key)
- ✅ `pnpm typecheck` + `pnpm lint` pass
- ✅ Stub mode still works without `RESEND_API_KEY` set

---

## Next Steps

1. User signs up at resend.com → obtains API key
2. Run `/ck:plan` to produce phased implementation plan
3. Implement via `/ck:cook`
4. Smoke-test on Vercel preview deploy
5. Optional follow-up: verify scoutpaw.tv domain → switch `NEWSLETTER_FROM_EMAIL` to `notifications@scoutpaw.tv`

---

## Unresolved Questions

- Final `TEAM_NOTIFICATION_EMAIL` value — user will provide directly in Vercel env (no commit needed)
- Should rate-limit window be tightened now that real emails are sent? (Current is fine for <100/mo)
- Domain verification timing — pre-launch or post-launch? (Recommend post-launch unless emails to Gmail recipients show up in spam)

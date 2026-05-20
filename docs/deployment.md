# Deployment

ScoutPaw deploys to **Vercel** on the default `*.vercel.app` URL for MVP. Custom domain is post-MVP.

## Prerequisites (one-time)

1. **Git** — project is not yet a git repo. Init before deploy:
   ```bash
   git init
   git add .
   git commit -m "feat: scoutpaw mvp scaffold"
   ```
   Push to GitHub/GitLab/Bitbucket.
2. **Vercel account** — sign up at vercel.com.
3. **Vercel CLI** — `pnpm add -g vercel`.

## Steps

### 1. Link to Vercel

```bash
vercel login
vercel link        # creates project on first run
```

### 2. Set production environment variables

In Vercel dashboard → Project → Settings → Environment Variables, add:

| Name | Value | Scope |
|---|---|---|
| `CONTENT_SOURCE` | `json` | Production, Preview |
| `SHOPIFY_MODE` | `mock` (until store live → `live`) | All |
| `SHOPIFY_STORE_DOMAIN` | (empty for now) | All |
| `SHOPIFY_STOREFRONT_TOKEN` | (empty for now) | All |
| `NEWSLETTER_MODE` | `stub` (until Resend ready → `live`) | All |
| `RESEND_API_KEY` | `re_xxx` from https://resend.com/api-keys | Production |
| `TEAM_NOTIFICATION_EMAIL` | team inbox (e.g., `team@scoutpaw.tv`) | Production |
| `NEWSLETTER_FROM_EMAIL` | `onboarding@resend.dev` (or verified-domain address) | Production |
| `DIAGNOSTIC_SECRET` | `openssl rand -hex 16` output (optional; enables `/api/newsletter/health`) | Production (optional) |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` (when GA account exists) | Production |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL once provisioned | Production |
| `REVALIDATE_SECRET` | random 32-char string (post-MVP for Shopify webhooks) | Production |

### 3. Deploy

```bash
vercel --prod
```

Vercel auto-detects Next.js and runs `pnpm build` + `pnpm start`.

## Post-Deploy Smoke Test

Visit production URL and verify:

- [ ] Home loads — banner, 5 character cards, video grid empty state, newsletter form
- [ ] Shop loads — 4 mock products visible
- [ ] Click a character — `/characters/[slug]` loads with themed accent
- [ ] Click a Coming Soon nav item — themed page loads with email form
- [ ] Submit newsletter form — success message
      - stub mode → check Vercel function logs for `[newsletter:stub]`
      - live mode → check team inbox for "New ScoutPaw subscriber: …" within 5s
- [ ] Cookie consent banner appears at first visit; accept → GA loads (if `NEXT_PUBLIC_GA_ID` set)
- [ ] Lighthouse on Home: perf ≥ 90, a11y ≥ 95, SEO ≥ 90
- [ ] Lighthouse on Shop: perf ≥ 90, a11y ≥ 95, SEO ≥ 90
- [ ] Security headers present — verify at https://securityheaders.com

## Switching Mock → Live

### Shopify (when store is ready)
1. Generate Storefront API token in Shopify admin → Apps → Develop apps → Storefront API
2. Set `SHOPIFY_MODE=live`, `SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com`, `SHOPIFY_STOREFRONT_TOKEN=...`
3. Redeploy. Real products replace mocks. Buy Now opens real Shopify URLs.
4. (Optional) Register Shopify webhook → POST `https://{site}/api/revalidate` with `REVALIDATE_SECRET` (route not yet built — add when needed).

### Resend (when account is ready)
1. Sign up at https://resend.com, copy API key from dashboard
2. Set `NEWSLETTER_MODE=live`, `RESEND_API_KEY=re_...`, `TEAM_NOTIFICATION_EMAIL=<team inbox>`
3. (Initial) Leave `NEWSLETTER_FROM_EMAIL=onboarding@resend.dev` — note this only delivers to the Resend-account-owner address
4. (Production) Verify `scoutpaw.tv` domain in Resend → switch `NEWSLETTER_FROM_EMAIL=notifications@scoutpaw.tv`
5. Redeploy. Every signup triggers an internal notification email to the team inbox.

## Newsletter Diagnostics

When a signup arrives but no team notification email follows, hit the diagnostic endpoint to see what the production runtime is actually seeing:

```bash
curl "https://<vercel-url>/api/newsletter/health?key=$DIAGNOSTIC_SECRET"
```

Expected response:
```json
{
  "mode": "live",
  "hasResendKey": true,
  "hasTeamEmail": true,
  "hasFromEmail": true,
  "fromEmail": "onboarding@resend.dev",
  "teamEmailMasked": "lon***@gmail.com",
  "nodeEnv": "production",
  "diagnosticTimestamp": "2026-05-19T01:57:00.000Z"
}
```

Interpretation:
- `mode: "stub"` → `NEWSLETTER_MODE` is missing/wrong in production env. Fix in Vercel dashboard, **redeploy**.
- `hasResendKey: false` → `RESEND_API_KEY` missing in current deployment. Same fix.
- `hasTeamEmail: false` → `TEAM_NOTIFICATION_EMAIL` missing. Same fix.
- All `true` and `mode: "live"` → submit a real subscribe; check Vercel function logs for `[newsletter:resend] sent ok` with a Resend message-id. If the log appears, cross-check Resend dashboard → Logs. If not in the log, suspect rate-limit or honeypot.

**Important:** Vercel env-var changes do NOT apply to existing deployments. After updating env vars, trigger a new deployment.

**Disable the endpoint:** unset `DIAGNOSTIC_SECRET` in Vercel and redeploy. Endpoint then returns 404.

**Endpoint behavior:**
- `DIAGNOSTIC_SECRET` unset → `404 Not found`
- Missing or wrong `key` param → `401 Unauthorized`
- Correct `key` → `200` + JSON snapshot (booleans + masked PII; never raw secret values)

### Custom domain (post-MVP)
1. Vercel dashboard → Domains → Add
2. Update DNS at your registrar (A/CNAME per Vercel instructions)
3. Cert auto-provisions
4. Update `NEXT_PUBLIC_SITE_URL` env var

## Compliance Pre-Public-Launch (Required)

Currently OK for soft/closed launch. Before public:
- [ ] Add privacy policy page (`/privacy`) — required if collecting emails
- [ ] Add terms page (`/terms`) — recommended
- [ ] Verify cookie consent banner blocks GA load until accepted (already wired)
- [ ] Test email submissions log/store correctly per privacy policy

## Troubleshooting

- **Build fails on Vercel**: check Node version. Project requires Node ≥ 18.18 (Next 15). Vercel uses 20 LTS by default.
- **Images broken**: verify Shopify CDN domain is in `next.config.ts → images.remotePatterns`.
- **Cookie banner never appears**: clear `localStorage` key `scoutpaw.consent.v1`.
- **GA not firing**: verify `NEXT_PUBLIC_GA_ID` is set AND user has accepted consent.

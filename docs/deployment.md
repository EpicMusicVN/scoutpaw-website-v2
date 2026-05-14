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
| `NEWSLETTER_MODE` | `stub` (until ConvertKit ready → `live`) | All |
| `CONVERTKIT_API_KEY` | (empty for now) | All |
| `CONVERTKIT_FORM_ID` | (empty for now) | All |
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
- [ ] Submit newsletter form — success message (server logs payload via stub mode)
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

### ConvertKit (when account is ready)
1. Create form, copy form ID + API key
2. Set `NEWSLETTER_MODE=live`, `CONVERTKIT_API_KEY=...`, `CONVERTKIT_FORM_ID=...`
3. Redeploy. Submissions go to real list, tagged by source.

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

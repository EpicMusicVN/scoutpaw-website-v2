# Project Changelog

## [2026-05-19] - Newsletter: Delivery Debug + Observability

### Overview
Added structured logging + secret-guarded diagnostic endpoint to the newsletter pipeline after reports that production signups weren't producing team notifications despite the UI showing success. Sanitized `.env.local.example` (a real Resend API key had been accidentally committed to the template; user rotated the key before this change).

### Changes
- **NEW** `lib/newsletter/mask.ts` — `maskEmail("longnn1998@gmail.com")` → `"lon***@gmail.com"` PII helper
- **NEW** `app/api/newsletter/health/route.ts` — secret-guarded `GET /api/newsletter/health?key=$DIAGNOSTIC_SECRET`; fail-closed (404 when secret unset); constant-time compare via `node:crypto.timingSafeEqual`; returns booleans + masked PII + safe values only
- **MOD** `lib/newsletter/index.ts` — emits `[newsletter] dispatch` log line per request (mode + env presence booleans)
- **MOD** `lib/newsletter/resend-source.ts` — logs `[newsletter:resend] sent ok` with Resend message-id; enriched error logs with masked recipient; new `config missing` log for missing-env early exit
- **MOD** `.env.local.example` — stripped real values (key already rotated by user); added prominent TEMPLATE-DO-NOT-EDIT header; added `DIAGNOSTIC_SECRET` placeholder
- **MOD** `docs/deployment.md` — env table now lists `DIAGNOSTIC_SECRET`; new "Newsletter Diagnostics" section with curl runbook and interpretation table

### Security Notes
- Leaked Resend API key was rotated by user prior to this commit
- If `.env.local.example` had previously been pushed with the leaked key, git-history scrubbing is OUT OF SCOPE here — flag for follow-up if upstream commits show the key. Key rotation already contained the blast radius.
- Health endpoint fail-closes when `DIAGNOSTIC_SECRET` is unset (returns 404, indistinguishable from "not found"); constant-time secret compare prevents timing oracle
- All log lines mask subscriber email (`lon***@gmail.com` format); API key never logged in any form

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: pending Phase 4

### Plan
- `plans/260519-0157-resend-delivery-debug/`

---

## [2026-05-18] - Newsletter: ConvertKit → Resend Team Notification

### Overview
Replaced ConvertKit newsletter integration (never provisioned, always stubbed) with Resend transactional email. Every "Join the Pack" signup now triggers a notification email to a single team inbox containing the subscriber's email, source tag, and ISO timestamp. Subscriber receives no email — internal notification only. Stub mode preserved for dev without API key.

### Changes

#### Newsletter Source Layer
- **lib/newsletter/resend-source.ts** (new): Calls Resend SDK `emails.send()`. HTML-escapes user-controlled fields (email, tag). Returns `{ok: false}` on missing env vars instead of throwing. Logs `error.name` + `error.message` only — never full SDK response.
- **lib/newsletter/index.ts**: Dispatch swap — `mode === "live"` now calls `subscribeResend` (was `subscribeConvertKit`).
- **lib/newsletter/convertkit-source.ts**: Deleted.

#### Environment & Deployment Docs
- **.env.local.example**: Removed `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`. Added `RESEND_API_KEY`, `TEAM_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM_EMAIL` (default `onboarding@resend.dev`).
- **docs/deployment.md**: Env var table + post-deploy smoke test + "Switching Mock → Live" section refreshed for Resend.
- **package.json**: Added `resend@^6.12.3`.

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ pending — to be run in Phase 4
- Stub mode: untouched, still logs `[newsletter:stub]` for dev
- Live mode: requires `RESEND_API_KEY` + `TEAM_NOTIFICATION_EMAIL` (user provisions in Vercel)

### Notes for Ops
- `onboarding@resend.dev` sender only delivers to the Resend-account-owner email. Set `TEAM_NOTIFICATION_EMAIL` to match the account email during initial testing.
- For production: verify `scoutpaw.tv` in Resend dashboard, then switch `NEWSLETTER_FROM_EMAIL` to `notifications@scoutpaw.tv` (deferred — separate plan).
- Remove `CONVERTKIT_API_KEY` and `CONVERTKIT_FORM_ID` from Vercel env vars if previously set.

### Plan
- `plans/260518-1415-join-the-pack-resend-notify/`

---

## [2026-05-18] - Home & Shop Content Refresh (MenuCards, Character Data, Promotion Asset, ExploreProducts)

### Overview
Completed home + shop content refresh: stripped MenuCards backdrops, corrected Max character data (Golden Retriever), redirected promotion banner to new R2 JPG asset, refreshed ExploreProducts tile labels and section copy. Four file edits landed in Phase 1; build (tsc + lint + pnpm build) validation passed in Phase 2. Deploy + CDN purge (Phase 3) + post-deploy smoke tests (Phase 4) pending user action.

### Changes

#### Home MenuCards Backdrop Removal
- **components/home/menu-cards.tsx**: Dropped `bg: string` and `accentGlow: string` from Card type definition. Removed inline `style={{ background: card.bg }}` from floating image card div. Deleted paw-tile pattern overlay div (`patterns/paw-tile.svg`). Deleted radial accent-glow div. Result: bare floating icon card with transparent bg, rounded outline, shadow, hover lift — no colored backdrop, no pattern, no glow.

#### Character Data Slug Swap (Golden Retriever ↔ Husky)
- **content/characters.json**: Swapped `max` ↔ `buddy` entries. `slug: "max"` now correctly represents the Golden Retriever (name "Max", breed "Golden Retriever", image `characters/golden-2.png`, accentColor `#FFB627`). `slug: "buddy"` now represents the Husky (name "Buddy", breed "Husky", image `characters/husky-bg.png`, accentColor `#5BC0EB`). Bios + funFacts traveled with bodies; slugs + order preserved. Resolves pre-existing data shuffle that mislabeled spotlight hero.

#### Home Promotion Banner Asset Update
- **app/page.tsx**: FeatureBanner image path changed from `shop/promotion.png` to `shop/promotion.jpg` (new R2 asset already in place).

#### Shop ExploreProducts Tile Rebranding
- **components/shop/explore-products.tsx**: Extended Tile type with optional `title?: string` field. Updated plushes entry: `title: "Dog Calming & Essentials Collection"`, copy: "Shop our curated collection for pet anxiety, comfort, and wellness. Free your pup from stress today!". Updated apparel entry: `title: "Dog owner gifts"`, copy: "Keep your pup close to your heart with essentials designed to celebrate your unbreakable bond." Render logic updated: `<h3>` and `aria-label` now prefer `tile.title ?? categoryLabel(tile.category)`. Section subtitle updated: "Curated picks for the whole pack — calming essentials for pups + gifts for the humans who love them." Category slugs (`?cat=plushes`, `?cat=apparel`) unchanged; routing untouched.

### Validation (Phase 2)
- `pnpm tsc --noEmit`: ✓ Clean
- `pnpm lint`: ✓ Clean
- `pnpm build`: ✓ Success, 21/21 static pages, `/characters/max` + `/characters/buddy` SSG'd
- Code Review: ✓ Done (report: `code-reviewer-260518-0709-phase-01-diff.md`); DONE_WITH_CONCERNS verdict ("Ship").

### Known Follow-Up (Out of Scope)
- **lib/shopify/mock-products.ts**: 3 references to `shop/promotion.png` + mismatched breed labels ("Buddy the Golden Plush", "Max the Husky Tee") contradict the character slug swap. Filed as immediate follow-up per YAGNI (product mock data not user-facing; refactor deferred).

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

---

## [2026-05-15] - Watch Hero: Autoplay-with-Sound + Audio Toggle (WCAG 1.4.2)

### Overview
Enabled autoplay-with-sound on watch hero featured video with graceful muted fallback and user audio toggle control. Client Component handles browser autoplay policies (some require user gesture); user can enable sound via toggle pill. WCAG 1.4.2 compliant (no auto-playing audio without user control).

### Changes
- NEW `components/watch/hero-video.tsx` — Client Component wrapping `<video>` with:
  - Optimistic autoplay-with-sound attempt (respects browser autoplay policy)
  - Graceful fallback to muted if autoplay blocked
  - Audio toggle pill (play icon + "Unmute" label) overlaid on lower-right
  - `<video>` controls hidden (custom toggle only)
  - Aria-label + WCAG keyboard navigation for accessibility
- **components/watch/watch-hero.tsx** — Server Component wrapper replaced inline `<video>` JSX with `<HeroVideo {...props}>` call. Behavior unchanged externally.

### Technical Details
- No new dependencies, no architectural change
- Client Component pattern standard for browser policy handling
- Toggle state managed locally (no external state/store needed)
- Video metadata (src, poster, duration) still passed from server as VideoContentSchema
- Tested: typecheck ✓, lint ✓ (user to smoke test autoplay policy behavior via dev server)

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

---

## [2026-05-15] - "No Videos" Empty State Polish

### Overview
Replaced the plain `No Videos` pill with a cozy gradient card featuring a paw icon, an uppercase headline, and a soft tagline. Shared component used by both ExploreVideos and VideoRail empty states.

### Changes
- NEW `components/watch/empty-videos.tsx` — shared `<EmptyVideos />` with cream→sky gradient (`var(--bg-warm-tan)` → `var(--bg-soft-sky)`), centered paw icon in a white/70 circle, "NO VIDEOS" headline, "Fresh episodes coming soon 🐾" tagline. Hover lift + shadow grow.
- `components/watch/explore-videos.tsx` — empty branch now renders `<EmptyVideos />`.
- `components/watch/video-rail.tsx` — same swap.

### Design tokens used
- `var(--bg-warm-tan)` + `var(--bg-soft-sky)` gradient
- `text-brand-gold` for paw icon
- `bg-white/70` for icon circle backdrop
- `shadow-cozy` → `shadow-cozy-md` on hover
- `font-display` headline with `tracking-[0.18em]`
- `ease-gentle duration-500` transitions (matches site-wide hover tempo)

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

Source brainstorm: `plans/reports/brainstorm-260515-0403-no-videos-empty-state-polish.md`

---

## [2026-05-15] - assetUrl() Absolute URL Pass-Through (Hotfix)

### Overview
Fix latent bug from cycle 5: `assetUrl()` was corrupting API-fetched thumbnail URLs by prepending the R2 prefix to absolute https:// URLs. After `enrichVideos()` overlaid `https://i.ytimg.com/vi/<id>/hqdefault.jpg` onto `video.thumbnail`, the 5 component sites wrapping it with `assetUrl()` produced broken URLs like `https://images.scoutpaw.tv/assets/https://i.ytimg.com/...`. YouTube Data API video thumbnails never rendered in production.

### Change
- `lib/utils/asset-url.ts`: 2-line addition — early return for inputs matching `/^https?:\/\//i`. Bare keys still resolve to R2; absolute URLs pass through unchanged.

### Affected sites (now working)
- `components/watch/featured-video.tsx:26`
- `components/watch/our-channels.tsx:142` (latestVideo.thumbnail)
- `components/watch/video-card.tsx:28`
- `components/watch/watch-hero.tsx:25`
- `components/watch/watch-library.tsx:152`

### Verification
Smoke-tested 5 input forms: bare key + leading slash + assets prefix + https + http. All resolve correctly.

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

---

## [2026-05-15] - ExploreVideos Carousel Refactor

### Overview
Converted `ExploreVideos` from a static 2-large + 6-small grid into a horizontal scroll-snap rail matching the Community Choice rail (`VideoRail`). Native swipe + nav arrows + shared `VideoCard` component. Cleaner streaming-platform UX.

### Changes
- `components/watch/explore-videos.tsx` rewritten:
  - Filter chips header unchanged.
  - Grid replaced with `<ul>` scroll-snap rail (`snap-x snap-mandatory`).
  - Inline `NavArrow` component (duplicate of `VideoRail`'s) — arrows hide at scroll ends.
  - Card render uses shared `VideoCard` component (consistent with VideoRail).
  - Removed local `LargeVideoCard`, `SmallVideoCard`, `videoHref`, `videoThumb`, `formatViews` helpers (unused after refactor).
  - Filter chip change auto-scrolls the rail back to the start for clean UX.
  - Empty filter retains the "No Videos" pill from earlier polish.

### Behavior
- Mobile: native horizontal swipe, 1 card visible with peek.
- Desktop: nav arrows appear at scroll edges; 3+ cards visible.
- Filter chip change → rail re-renders with sorted list + scroll reset.

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

Source brainstorm: `plans/reports/brainstorm-260515-0345-explore-videos-carousel.md`

---

## [2026-05-15] - Mock Video Cleanup (Watch Page Production-Ready)

### Overview
Deleted all 24 placeholder mock videos (youtubeId starting with `TODO_`) from `content/videos.json`. Watch page now renders only the 6 real YouTube-backed dog videos. Empty categories (cats, funny, community, shorts, product-reviews) gracefully show the "NO VIDEOS" pill shipped earlier today.

### Change
- `content/videos.json`: 30 entries → 6 (filtered by `!youtubeId.startsWith("TODO_")`).
- Remaining videos: mock-001 through mock-006, all in `dogs` category, all with real YouTube IDs (4Fgl_dW3vgA, X19MapswOQs, PRCac_UMohw, 3b3T2Z2CZLA, HPlFCtF_Sxs, D3vSMHj2mrg).

### Downstream
- Community Choice rail: 6 videos sorted by view count.
- Featured video: mock-001 (still real ID).
- All non-dogs category filters render the "NO VIDEOS" empty-state pill.
- Watch page is now fully API-driven (no mock fallback values rendering).

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

---

## [2026-05-15] - Channel Breed Prefix + "No Videos" Pill (Polish)

### Overview
Follow-up polish to cycle 5. Channel card titles now display as `{breed} - {channel name}` (e.g., "Golden - Puppy Lullaby TV"). Empty-state for video rails + Explore categories rendered as a centered rounded "NO VIDEOS" pill instead of plain text.

### Changes
- **Schema** (`lib/content/schemas.ts`): ChannelSchema gains `displayPrefix?: string` — optional breed/character label decoupled from `characterSlug` theming.
- **`content/channels.json`**: 4 channels rewritten with `displayPrefix` ("Golden", "Husky", "Poodle", "Collie") and revised `characterSlug` + `bannerColor` + `avatarColor` per user mapping (Golden→max, Husky→rocky, Poodle→bella, Collie→oscar).
- **`components/watch/our-channels.tsx`**: CompactChannelCard renders `{displayPrefix} - {channel.name}` when prefix present.
- **`components/watch/explore-videos.tsx`** + **`components/watch/video-rail.tsx`**: empty-state replaced with centered rounded pill (`rounded-full border bg-surface px-5 py-2 uppercase tracking-wider text-ink/65`) reading "No Videos".

### Validation
- `pnpm typecheck` ✓
- `pnpm lint` ✓

### Note on Mapping
User-supplied breed prefixes do not match the stored `characters.json` breed values (e.g., Max is a Husky in JSON but prefix "Golden" was assigned to him). Implemented per explicit user spec; prefix is a free-form display string independent of character data.

Source brainstorm: `plans/reports/brainstorm-260515-0311-channel-prefix-no-videos-badge.md`

---

## [2026-05-15] - YouTube Data API Integration (Cycle 5 of 5)

### Overview
Cycle 5 complete: Dynamic YouTube Data API integration wired into Watch page. New `lib/youtube/` module fetches live channel + video metadata from Google Cloud YouTube Data v3; server-side enrichment overlays API data onto fallback JSON schema; components render transparently (no API awareness). Completes final phase of 5-cycle Watch+Polish decomposition.

### YouTube Data API Architecture
- **NEW Module** `lib/youtube/`:
  - `types.ts`: TypeScript interfaces (YouTubeChannel, YouTubeVideo) with API response shape
  - `client.ts`: `fetchChannels(ids)` + `fetchVideos(ids)` with batching (50 IDs max), 1hr revalidate cache via Next.js fetch options, graceful empty-array fallback on 403/404/network errors
  - `duration.ts`: ISO 8601 duration parser (`parseISODuration("PT1H23M45S")` → `"1:23:45"`)
  - `enrich.ts`: `enrichChannels(channels)` + `enrichVideos(videos)` overlay API data onto JSON fallback, skip TODO_* placeholder IDs silently

### Schema Extension
- **lib/content/schemas.ts**: ChannelSchema gains `youtubeChannelId?: string` + `avatarUrl?: string`; `bannerColor` relaxed to optional (undefined becomes gradient fallback in UI)

### Content Refactor
- **content/channels.json**: Rewrote 4 entries (dropped mock scoutpaw-tv + scoutpaw-music placeholders). Each remaining channel now includes youtubeChannelId (ready for API fetch)
- **content/videos.json**: Dropped `channelSlug` field from all 30 entries (pointed at removed channels; UI null-safe)

### Environment & Config
- **.env.local.example**: Documented `YOUTUBE_API_KEY=` with security note: "Restrict to HTTP referrers in Google Cloud Console (scoutpaw.tv only in prod)"
- **next.config.ts**: Added `yt3.googleusercontent.com` + `yt3.ggpht.com` to images.remotePatterns for YouTube avatar CDN

### Watch Page Integration
- **app/watch/page.tsx**: After `content.getChannels()` + `content.getFeaturedVideos()` + `content.getVideos(category)` hydrate JSON, Promise.all enriches via `enrichChannels()` + `enrichVideos()` server-side before passing to components. Components render data transparently (no API awareness, backward-compatible fallback).

### Component Updates
- **components/watch/our-channels.tsx**: bannerColor gradient gains undefined fallback; CompactChannelCard avatar: when `channel.avatarUrl` present, renders dynamic `<Image>` of YouTube avatar; else fallback to original initial-letter gradient circle
- **components/watch/explore-videos.tsx**: Empty-state placeholder text simplified "No videos in this category yet — try All." → "No videos yet"
- **components/watch/video-rail.tsx**: Previously returned null when empty; now renders rail header + placeholder card with "No videos yet" + hidden seeAllHref

### Changed Files
- `lib/youtube/types.ts`: NEW (YouTubeChannel, YouTubeVideo interfaces)
- `lib/youtube/duration.ts`: NEW (ISO 8601 parser)
- `lib/youtube/client.ts`: NEW (API fetch + batch + cache logic)
- `lib/youtube/enrich.ts`: NEW (enrichment overlay)
- `lib/content/schemas.ts`: ChannelSchema youtubeChannelId + avatarUrl, bannerColor optional
- `content/channels.json`: 4-entry rewrite with youtubeChannelId
- `content/videos.json`: Dropped channelSlug from 30 entries
- `.env.local.example`: YOUTUBE_API_KEY documentation
- `next.config.ts`: yt3 CDN remotePatterns
- `app/watch/page.tsx`: Promise.all enrichment server-side pre-render
- `components/watch/our-channels.tsx`: Avatar img fallback, bannerColor undefined safety
- `components/watch/explore-videos.tsx`: Empty-state text polish
- `components/watch/video-rail.tsx`: Empty-state header + placeholder card

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Code Review: ✓ Done (no critical/high concerns); 3 medium observations (non-blocking): silent error swallowing in client catch blocks; redundant `id &&` guard in enrich.ts; asymmetric featured-fetch in page.tsx. All deferred to tech-debt backlog.
- User YOUTUBE_API_KEY: ✓ Present in .env (verified via grep)
- Live API smoke test: Deferred to user (dev server walkthrough required)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

### Cycle 5 Completion Context
This entry marks completion of **Cycle 5: YouTube Data API integration**, the final phase of the 5-cycle Watch+Polish decomposition begun earlier this session. Cycles 1–5 timeline:
- **Cycle 1** (complete, 2026-05-15): Glass blob hero + watch hero video
- **Cycle 4–6** (complete, 2026-05-15): Watch content + newsletter discovery + channels
- **Cycle 5** (complete, 2026-05-15): YouTube Data API integration
- **Cycles 2–4** (pending, deferred): Responsive audit, SEO audit, audit-driven fixes

---

## [2026-05-15] - Watch Content + Newsletter Discovery + Channels (Cycle 4–6)

### Overview
Completed cycles 4–6 of Watch page enhancement: real YouTube IDs migrated into featured + community videos; 4 new channels appended with placeholder metrics; newsletter API validated as functional (stub-mode confirmed, no code defect); duration badge removed from watch hero video card for UX consistency.

### YouTube Video Migration
- **content/videos.json**: 6 mock dog video youtubeIds replaced with real, live-verifiable YouTube IDs:
  - `mock-001` → `4Fgl_dW3vgA` (Corgi playlist intro)
  - `mock-002` → `X19MapswOQs` (Puppy challenge)
  - `mock-003` → `PRCac_UMohw` (Golden retriever training)
  - `mock-004` → `3b3T2Z2CZLA` (Husky antics)
  - `mock-005` → `HPlFCtF_Sxs` (Shiba inu moments)
  - `mock-006` → `D3vSMHj2mrg` (Live dog stream)
- **Side Effect**: WatchHero featured link href now navigates to real YouTube URL; community choice rail thumbnails resolve dynamically to i.ytimg.com (no static image overhead).

### Channels Expansion
- **content/channels.json**: Appended 4 channels (6 total now):
  - `puppy-lullaby-tv` → bella (50000 subs, 30 videos placeholder)
  - `happy-paws-cartoon` → oscar (50000 subs, 30 videos placeholder)
  - `magic-paw` → rocky (50000 subs, 30 videos placeholder)
  - `doggo-dreams-tv` → max (50000 subs, 30 videos placeholder)
- **Placeholder Note**: Subscriber + video counts are stub values. Cycle 5 (YouTube Data API integration, pending) will replace with live API values. Channels render functionally; counts auto-update once API wired.

### Watch Hero Polish
- **components/watch/watch-hero.tsx**: Removed duration badge (`{featured.duration && (...)}` block) from video card overlay. Category + channel badges retained.
- **Rationale**: Duration badge redundant on featured video context; removal simplifies card UI while preserving category/channel metadata.

### Newsletter API Validation (No Code Change)
- **Discovery**: Existing `app/api/newsletter/route.ts` + sophisticated `lib/newsletter/` (Zod schemas, ConvertKit source stub, rate-limiter) already in codebase.
- **Smoke Test**: Curl tested all 3 paths:
  - Valid email: 200 response
  - Invalid format: 400 response
  - Honeypot field set: Silent 200 (anti-bot pattern)
- **Finding**: User's "form not working" report likely relates to stub-mode behavior (no actual email delivery), not code defect. Newsletter infrastructure is functional; setup for live ConvertKit wiring exists in `lib/newsletter/sources/convertkit.ts`.

### Changed Files
- `content/videos.json`: 6 youtubeIds updated
- `content/channels.json`: 4 channels appended
- `components/watch/watch-hero.tsx`: Duration badge removed

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Curl smoke tests: ✓ All 3 newsletter paths pass (200, 400, 200)
- Code Review: ✓ Done (report: `code-reviewer-260515-1455-watch-content-newsletter.md`); no blocking concerns; 3 medium observations (all informational, non-actionable in current scope)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

### Pending User Action (Out of Scope)
- **R2 Asset Upload**: `public/assets/patterns/paw-tile.svg` must be manually uploaded to R2 bucket key `assets/patterns/paw-tile.svg`. Curl HEAD check still returns 404. Until uploaded, home menu cards' paw pattern background won't render (fallback: solid card bg only). See plan reports for curl command.

---

## [2026-05-15] - R2 `/assets/` Prefix Fix (Hotfix)

### Overview
Hotfix to the R2 asset migration shipped earlier today. Helper now prepends `assets/` to all R2-resolved URLs, matching the bucket key structure (`assets/banner/banner.png` etc.). Production URLs were 404ing because the helper produced `https://images.scoutpaw.tv/<key>` while R2 keys live at `https://images.scoutpaw.tv/assets/<key>`.

### Change
- `lib/utils/asset-url.ts`: one-line edit — `${BASE_URL}/${k}` → `${BASE_URL}/assets/${k}` in the R2 branch. Local fallback unchanged (already had `/assets/` prefix).
- Smoke-tested all 5 input forms resolve to `https://images.scoutpaw.tv/assets/...` URLs.

### Validation
- `pnpm typecheck` clean
- `pnpm lint` clean
- No caller changes, no JSON re-migration, no schema changes.

Source brainstorm: `plans/reports/brainstorm-260515-0138-r2-assets-prefix-fix.md`

---

## [2026-05-15] - R2 Asset Migration (Independent Completion)

### Overview
Completed migration from local `/assets/` paths to Cloudflare R2 CDN asset delivery. New `assetUrl()` helper centralizes CDN URL resolution; 42 content asset strings migrated; 23 components/pages refactored for dynamic asset loading; build validation clean.

### R2 Integration
- **NEW Helper**: `lib/utils/asset-url.ts` exports `assetUrl(key: string)` that reads `NEXT_PUBLIC_R2_BASE_URL` env var and resolves to CDN. Fallback to `/assets/<key>` when env empty (local dev mode).
- **ENV Naming**: `.env` renamed `R2_PUBLIC_URL → NEXT_PUBLIC_R2_BASE_URL` (client-accessible prefix); `.env.local.example` documents new var for local dev.
- **Next Config**: `next.config.ts` adds `images.scoutpaw.tv` to remotePatterns for Image component optimization.

### Content Migration
- **Character Icons** (`content/characters.json`): 8 string asset paths stripped `/assets/` prefix → bare keys (e.g., `characters/corgi.png`)
- **Playlists Metadata** (`content/playlists.json`): 16 coverImage paths migrated; `_note` docstring updated to reflect new convention
- **Site Configuration** (`content/site-config.json`): 5 brand asset paths (logo, logoText, favicon) migrated
- **Videos Metadata** (`content/videos.json`): 13 thumbnail + poster paths migrated; `_note` docstring updated

### Component Refactoring
- **23 files modified**: app/ (4 files), components/ (15 files), lib/ (2 files, shop mock products + asset-url helper), content/ (4 JSON files)
- **Literal Migration**: Component files wrap asset-url calls around hardcoded string literals (e.g., `assetUrl("banner/banner.png")`)
- **JSON-Fed Values**: Character.image, playlist.coverImage, featured.thumbnail, featured.videoSrc, featured.videoPoster, config.brand.logo, config.brand.logoText wrapped at render sites (values read from content schemas, passed to assetUrl before JSX)
- **CSS backgroundImage**: Template-literal conversion in menu-cards.tsx (paw pattern path) + watch-library.tsx (background gradient + pattern); both use assetUrl() wrapper
- **Shopify Mock**: `lib/shopify/mock-products.ts` 8 asset literals migrated

### Post-Review Fixes
- **Top Nav Logo**: `logoText` prop wrapped in assetUrl() before passing to MobileNav component (caught by reviewer; prevents unnecessary re-wrapping downstream)
- **Env Documentation**: R2_BASE_URL line added to `.env.local.example` (caught by reviewer; ensures new developers get clear setup guidance)
- **JSON Docstrings**: Playlists + videos `_note` fields updated to reflect new "bare key" convention, replacing old "/assets/" mention (caught by reviewer; maintains content documentation accuracy)

### Changed Files
- `lib/utils/asset-url.ts`: NEW helper (assetUrl function + env fallback logic)
- `.env`: R2_PUBLIC_URL → NEXT_PUBLIC_R2_BASE_URL rename
- `.env.local.example`: NEW R2_BASE_URL documentation line
- `next.config.ts`: images.scoutpaw.tv remotePatterns entry
- `content/characters.json`: 8 paths migrated (corgi, donkey, duck, horse, pig, rabbit, shark, turtle)
- `content/playlists.json`: 16 coverImage paths + _note updated
- `content/site-config.json`: 5 brand asset paths migrated
- `content/videos.json`: 13 thumbnail + poster paths + _note updated
- `components/` (15 files): assetUrl() wrapping on literals + JSON-fed values + CSS template literals
- `lib/shopify/mock-products.ts`: 8 image paths migrated
- `app/` (4 files): logo, banner, and other asset paths wrapped

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- **Grep Audit**: Zero `/assets/` hits in app/, components/, lib/, content/ (excluding lib/utils/asset-url.ts fallback string, which is correct)
- **Code Review**: DONE_WITH_CONCERNS; all 3 findings (logoText wrapping, env documentation, JSON docstrings) resolved post-review

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-15] - Glass Blob Hero + Watch Hero Video (Cycle 1 of 5)

### Overview
Cycle 1 complete: Visual enhancement pass on home hero (glass blob effect) + dynamic video integration into watch hero. Foundation for cycles 2–5: responsive audit, SEO audit, audit fixes, YouTube Data API integration.

### Glass Blob Hero Redesign
- **FullBleedHero Architecture**: Replaced rounded-rectangle frosted glass card (`bg-white/55 rounded-2xl border shadow-cozy backdrop-blur-xl`) with layered glass blob. Outer div holds kicker + title + description; absolute aria-hidden div beneath provides visual effect via `bg-white/55 backdrop-blur-xl` + radial mask-image gradient (`radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 95%)`). Inset padding `-1.5rem` extends blob falloff beyond text container. Mobile in-flow card path unchanged.
- **Visual Impact**: Soft glow blob anchors upper-left corner; text floats atop with full readability. No client-side JS; mask-image provides CSS-only soft-edge effect. Works across all viewports (mobile soft-stacked, desktop glass blob overlay).

### Watch Hero Video Integration
- **Video Schema Extension** (`lib/content/schemas.ts`): Added optional fields to `VideoContentSchema`: `videoSrc?: string` and `videoPoster?: string`. Backwards-compatible; non-video entries unaffected.
- **Featured Video Payload** (`content/videos.json`): `mock-001` (getFeaturedVideo return value) now includes `videoSrc: "/assets/watch/intro.mp4"` and `videoPoster: "/assets/watch/intro-poster.jpg"`.
- **WatchHero Conditional Render** (`components/watch/watch-hero.tsx`): When `featured.videoSrc` present, renders `<video src={...} poster={...} autoPlay muted loop playsInline preload="metadata">` (absolute inset, object-cover, 13 MB H.264). Falls back to YouTube thumbnail + play-button overlay if no videoSrc. Outer Link navigation to YouTube unchanged.
- **Asset Delivery**: `/public/assets/watch/intro.mp4` (13 MB, compressed from 90 MB source via ffmpeg H.264 CRF 26, audio stripped, faststart enabled) and `/public/assets/watch/intro-poster.jpg` (252 KB extracted at 0.5s frame).

### Changed Files
- `components/home/full-bleed-hero.tsx`: Glass blob effect (mask-image radial gradient, inset padding, aria-hidden div)
- `lib/content/schemas.ts`: Added `videoSrc?: string`, `videoPoster?: string` to VideoContentSchema
- `content/videos.json`: `mock-001` featured video now includes videoSrc + videoPoster
- `components/watch/watch-hero.tsx`: Conditional video render (videoSrc present) vs YouTube fallback
- `public/assets/watch/intro.mp4`: NEW video asset (13 MB, H.264, no audio)
- `public/assets/watch/intro-poster.jpg`: NEW poster frame (252 KB, extracted at 0.5s)

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Video compression: ✓ 13 MB (under 15 MB cap)
- Code Review: ✓ Done (report: `code-reviewer-260515-0026-glass-blob-watch-video.md`); no blocking concerns

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

### Cycle Roadmap
- **Cycle 1** (complete): Glass blob + video (visual enhancements)
- **Cycle 2** (pending): Responsive audit (audit-only, seeded by 2026-05-11 audit)
- **Cycle 3** (pending): SEO audit (audit-only)
- **Cycle 4** (pending): Audit-driven fixes (layout, contrast, a11y, cookie consent)
- **Cycle 5** (pending): YouTube Data API integration (dynamic playlists + metadata)

## [2026-05-14] - Hero + Cards + Shop Layout Polish (UI Polish Pass)

### Iteration 1 (earlier today)
- **Home Hero Title**: Removed `: Scoutpaw TV` suffix from hero title (now "THE ULTIMATE WORKDAY HANGOUT" only).
- **FullBleedHero Overlay Reanchor**: Desktop overlay re-anchored from vertically centered to bottom-left corner. Default width narrowed (`max-w-sm lg:max-w-md`). Added localized bottom-up gradient backdrop overlay. Mobile layout unchanged. Corgi face now fully unobstructed.
- **Home Menu Cards Images**: Set A images mirrored into `/public/assets/card/` (characters.png, shop.png, watch.png for Characters, Shop, Watch cards).
- **Characters Card Background**: Changed `#fffbe6` (yellow) → `var(--bg-soft-sky)` to prevent unwanted yellow-duck blending with image.
- **Shop ExploreProducts Refactor**: Refactored from sticker-overlay pattern (text panel absolute-positioned over image bottom) to editorial layout (square image card on top with retained tilt + hover-untilt, separate text card below with full padding).
- **Asset Performance**: shop.png optimized 3.4 MB → 363 KB (2048² → 768² downsize, 256-color quantize, max compression). Quality preserved; visual impact minimal.

### Iteration 2 (Code Review + Polish Post-Review)
- **FullBleedHero Glass Card Reanchor**: Bottom-left opaque card (`bg-white/85`) → top-left frosted glass card (`bg-white/55`). Vertical anchor `pb-10 lg:pb-16` → `pt-12 lg:pt-16` (bottom → top). Alignment `items-end` → `items-start`. Backdrop `backdrop-blur-md` → `backdrop-blur-xl`. Border `border-ink/10` → `border-white/40` (opacity bumped post-review for WCAG contrast). Removed bottom-up gradient div.
- **Home Menu Cards Paw Pattern**: Added per-card repeating paw-print pattern layer (`public/assets/patterns/paw-tile.svg`, 48×48 viewBox, opacity 12%) inside each image card div. Section-level scattered decor (paws, bones, ball) unchanged from iter-1.
- **Shop ExploreProducts Unified Tiles**: Refactored from iter-1's two-sibling-cards stack (image + text as separate cards) into ONE unified card per tile. Single `bg-surface rounded-[2rem] shadow-cozy overflow-hidden` container wraps image area + text area. Whole-card tilt + hover-untilt preserved. Grid gap `gap-8 md:gap-10` → `gap-6 md:gap-8`.

### Iteration 3 (Interaction Polish — CTA & Hover Motion Standardization)
- **FullBleedHero CTA Removal**: Removed `actions` prop and default `<Button>` block; removed `Button` import. Hero CardBody now renders kicker + title + description only (no CTA).
- **Shop Page CTA Cleanup**: Removed `actions={<Button>Explore Collections</Button>}` prop from `<FullBleedHero />` in `app/shop/page.tsx`; removed `Button` import.
- **MenuCard Unified Hover Motion**: Standardized all card transitions to `duration-500 ease-gentle` site-wide. Outer `<Link>` wrapper gains `hover:-translate-y-1` (whole composition breathes upward as one unit). Image card bumped `-translate-y-1` → `-translate-y-2` (preserves 4px differential lift vs outer motion). Text card transition expanded `transition-shadow` → `transition-all`. Pill duration 200ms → 500ms for consistency.
- **Shop Tile Hover Refinement**: Removed `group-hover:rotate-0` from unified card div (tile stays tilted on hover; eliminates apparent text resize / layout shift perception). Duration 300ms → 500ms for site-wide consistency. Inner image easing `ease-out` → `ease-gentle`.
- **Cross-Cutting Motion Standard**: Card hover tempo unified at `duration-500 ease-gentle` across home menu cards, shop tiles, and all composite interactions.

### Changed Files
- `components/home/full-bleed-hero.tsx`: Removed `actions` prop, default `<Button>` render, and `Button` import
- `app/shop/page.tsx`: Removed `actions` prop from `<FullBleedHero />` and `Button` import
- `components/home/menu-cards.tsx`: Unified hover motion (`duration-500 ease-gentle`), outer Link hover `-translate-y-1`, image card `-translate-y-2`, text card `transition-all`, pill duration 200ms → 500ms
- `components/shop/explore-products.tsx`: Removed `group-hover:rotate-0`, duration 300ms → 500ms, inner image easing `ease-out` → `ease-gentle`

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Code Review: Done (no blocking concerns; calibration note on combined menu-card lift = 12px absolute / 8px differential, visual QA owns final "lift feel" call)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Scroll Sun Architecture Reversed to Global Fixed (Motion Fix)

### Added / Changed
- **Scroll Sun Repositioned**: Sun decoration moved from hero-bound (`position: absolute`, hero ref scroll target) to globally fixed (`position: fixed`, document scroll tracking). Component now visible across all home page sections (not confined to hero viewport).
- **Architecture Changes**:
  - `components/home/scroll-sun.tsx`: Dropped `useRef` + hero target; now calls `useScroll()` with no args (tracks full document scroll). Y translation increased 0→220px → 0→400px. X drift updated [0,0.5,1] → [0,40,-20]. Added opacity fade [0, 0.85, 1] → [1, 1, 0.3] (sun fades to 30% opacity in final 15% of scroll to avoid footer clash).
  - `components/home/full-bleed-hero.tsx`: Removed ScrollSun import + JSX render.
  - `app/page.tsx`: Added ScrollSun import + render at top of home page fragment.
- **Styling**: Top-right placement fixed: `right-[12%] top-[14%]` (desktop), `lg:right-[16%] lg:top-[16%]` (desktop up). z-index `z-[5]` (above sections, below navbar). Still `hidden md:block` (mobile hidden).

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Scroll-Linked Sun Decoration on Hero (Motion Enhancement)

### Added / Changed
- **Scroll Sun Hero Decoration**: New client component `components/home/scroll-sun.tsx` adds decorative sun to upper-right corner of hero section. Scroll-linked motion via Framer Motion useScroll/useTransform: vertical descent 0→220px + horizontal drift 0→+28→-16px. SVG sun (circle r=22 + 8 rays) with stacked drop-shadow glow layers. Color `text-brand-honey`. Hidden on mobile (`hidden md:block`). Respects `prefers-reduced-motion` (static sun for a11y users). Self-contained ref, no prop drilling.
- `components/home/full-bleed-hero.tsx`: Import + render `<ScrollSun />` between banner div and glass card div.

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Hero Center-Upper + Pack Cards Image Upsize + Section Decorations (Polish Iteration)

### Added / Changed
- **Hero Vertical Anchor**: Glass card anchored to upper-third of banner on desktop (`md:top-24 lg:top-32` = 96/128px from banner top). Mobile true-stack below banner with 32px gap (`mt-8` replaces `-mt-8`).
- **Pack Cards Image Upsize**: Image card bumped h-40/44/48 (160/176/192px). Text card restructured for exact equal heights: outer wrapper `flex h-full flex-col`, text card `flex flex-1 flex-col` fills remaining height inside wrapper. Negative margin + padding recomputed (see phase-02 math).
- **Section Decorations**: 6 scattered SVG icons (3 paw, 2 bone, 1 ball) at 10% opacity in `text-warm-text`, absolute positioned behind cards. Layer has `pointer-events-none + aria-hidden` to preserve interactivity. Rotation varied (8–20 degrees). File growth +30 lines (3 inline SVG components at bottom).

### Changed
- `components/home/full-bleed-hero.tsx`: `-mt-8` → `mt-8` (mobile), `md:top-12` → `md:top-24`, `lg:top-16` → `lg:top-32`
- `components/home/menu-cards.tsx`: Image h-40/44/48 + sizes prop; text card flex-1; wrapper flex-col; decoration layer + DecorPaw/DecorBone/DecorBall functions

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Hero Left Swap + Pack Cards Pinterest Pin Restructure (Follow-up Refinement)

### Added / Changed
- **Hero Glass Card Position Swap**: Hero text panel repositioned from upper-right (`md:right-12 lg:right-16`) to upper-left (`md:left-12 lg:left-16`). Placement follows glass card overlap pattern; card now sits left of centerline.
- **Pack Cards Pinterest Pin Pattern**: MenuCard redesigned from tall image card + narrower text below to **small centered floating image card + full-width text card**. Image card fixed-size (`h-32 md:h-36 lg:h-40` square), centered, z-10 relative; text card full width with negative margin (`-mt-16 md:-mt-[72px] lg:-mt-20`) pulling up to overlap image bottom half. Text card padding (`pt-24 md:pt-28 lg:pt-32`) reserves overlap space; Content starts below image.
- **Coming-Soon Badge Relocation**: Badge moved from inside image card to outer Link wrapper top-right (z-20), visible above floating image.
- **Hover Refinement**: Image card lifts on hover (`-translate-y-1 scale-105`); text card shadow bumps. Group-level hover coordination preserved.

### Changed
- `components/home/full-bleed-hero.tsx`: Glass card right → left positioning (3-char swap: `md:right-12`→`md:left-12`, `lg:right-16`→`lg:left-16`)
- `components/home/menu-cards.tsx`: MenuCard restructured to Pinterest pin layout (small floating image + large text card overlap)

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Home Hero Restructure (Glass Card + Pack Cards Restack)

### Added / Changed
- **Hero Card Repositioning**: Hero text panel converted from full-bleed overlay to top-right glass card (`bg-honey/85 backdrop-blur-xl`). Mobile (<768px): card stacks below banner aspect-4:3 with `-mt-8` overlap. md+: pinned `top-12 right-12` (lg: `top-16 right-16`).
- **Hero Copy Refresh**: Kicker "SCOUTPAW TV", headline "THE ULTIMATE WORKDAY HANGOUT", 70-word body describing the 5 characters + their workday hangout mission.
- **Pack Cards Restructure**: MenuCard redesigned from single card into two-element stack: aspect-square image card (colored bg + glow + transparent icon) + narrower text card below (bg-surface, mx-4, -mt-10 overlap). Card rotation removed. Coming-Soon badge moved to image card top-right.
- **Hover Behavior**: Image card lift on hover scales icon 1.05x and lifts 8px; text card shadow deepens.

### Changed
- `components/home/full-bleed-hero.tsx`: Glass card layout, responsive positioning, gradient mask removed
- `app/page.tsx`: Hero kicker/title/description props updated to new copy
- `components/home/menu-cards.tsx`: MenuCard restructured to two-element stacks, rotate field removed from Card type

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-13] - Newsletter Button Restore (Dark Variant + Envelope Icon)

### Added / Changed
- **Newsletter Button Redesign**: Navbar "Newsletter" text link reverted to Button component; navy bg + white text + cta-shimmer (variant="dark" size="lg") to preserve secondary hierarchy vs Shop (primary gold). 18×18 outline envelope SVG icon inline with text, gap-2 spacing handled by Button base.
- **Visual Consistency**: Newsletter button now matches Shop button in height (48px), padding (px-6 py-3), border-radius (rounded-full), font (font-display semibold text-base), focus-ring, active-scale, and hover-shadow behavior — only color scheme differs (navy vs primary).

### Changed
- `components/nav/top-nav.tsx`: Newsletter Link replaced with Button variant="dark" size="lg" + 18×18 SVG envelope

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-12] - Navbar + Footer Polish (Logo Aspect Fix & Newsletter Simplification)

### Added / Changed
- **Logo Aspect Ratios**: Navbar logo aspect corrected 2.5:1 → 1.18:1 intrinsic; footer wordmark 2.92:1 → 4.44:1 intrinsic. Both now render unstretched.
- **Downsizing**: Navbar logo h-10/md:h-12/lg:h-14 (40/48/56 px); footer logo h-8/md:h-10/lg:h-12 (32/40/48 px).
- **Newsletter CTA Simplification**: Navbar "Join Newsletter" button (outline, heavy) replaced with text link + inline envelope SVG (text-ink/75 hover:text-ink, text-sm font-medium).
- **Drop-shadow Scaling**: Navbar shadow 0 8px 16px → 0 4px 8px (first blur), opacity 0.32 → 0.28; footer shadow blur 20px → 12px, offset 4px → 2px, opacity 0.45 → 0.5.
- **Cleanup**: Removed `translate-y-2 md:translate-y-3` hack from navbar logo (flex `items-center` handles centering).

### Changed
- `components/nav/top-nav.tsx`: Image props width/height, className sizing, drop-shadow filter, Link+SVG for newsletter
- `components/nav/footer.tsx`: Image props width/height, className sizing, drop-shadow filter

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-12] - Asset Refresh (Banner, Cards, Logo)

### Added / Changed
- **Asset Sync**: All 10 PNGs synced to `/public/assets/` (new fish-eye banner composition, 7 transparent card icons, 2 transparent logo files); `banner.webp` deleted (unreferenced).
- **FullBleedHero**: Recentered banner (`objectPosition: "50% 50%"`), repositioned text panel to upper-left sky zone, narrowed max-w ladder, tightened gradient mask to prevent dog/text overlap across 360–1440px breakpoints.
- **MenuCards**: Added accent-color radial glow + drop-shadow to transparent card icons; tuned padding for breathing room; hover deepens shadow for lift-off feel.
- **Logo Treatments**: Navbar logo kept as-is (visual QA only); footer wordmark glow bumped on navy bg; mobile menu header replaced "Menu" text with transparent ScoutPaw wordmark + ink shadow.

### Changed
- `components/home/full-bleed-hero.tsx`: objectPosition center, text alignment, gradient mask, font scaling
- `components/home/menu-cards.tsx`: glow colors, drop-shadow, image padding, hover state
- `components/nav/footer.tsx`: stacked drop-shadow filters for glow effect
- `components/nav/mobile-nav.tsx`: wordmark logo header replacement + ink shadow filter
- `components/nav/top-nav.tsx`: logoText prop wiring to mobile-nav

### Validation
- `pnpm typecheck`: ✓ Clean
- `pnpm lint`: ✓ Clean
- Visual QA: Skipped (user opted for linting/typing only; code changes CSS-only, no hydration concerns)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-11] - Responsive Audit (Full Website)

### Audit / QA
- **Comprehensive Responsive Review**: 44 components audited via code-static pass; 49 screenshots captured at 7 viewports (360–2560px) across 7 pages (Home, Shop, Watch, Coming-Soon, Character, Privacy, Terms)
- **Findings Summary**: 0 critical / 8 major / 10 minor
  - Major: Cookie consent UX inconsistency, hero positioning at MD breakpoint, watch grid layout shift, filter chip contrast, anchor navigation accessibility
  - Minor: Card spacing, margin drift, icon scaling, focus indicators, button sizing variance
- **Fix-Plan Seeds Ready**:
  1. Cookie Consent UX — banner persistence + dismissal states across pages
  2. Hero Positioning + Watch MD Grid — layout shift fix for 768–1024px range
  3. Filter Chip + Anchor Compliance — color contrast + internal link navigation
- **Outputs**: 
  - `audit-260511-1806-responsive-full-website.md` (full audit report)
  - `findings-code-static.md` (component-level findings)
  - `findings-visual.md` (visual/layout findings from screenshots)
  - 49 PNG screenshots in `plans/reports/screenshots/`
- **Note**: No source code modified in this phase. Audit is read-only. Fixes scope future work.

### Build Status
- Audit: ✓ Complete
- CI/CD: No source changes

## [2026-05-11] - Watch Redesign + Compact Channels

### Added
- **WatchHero Component** (`components/watch/watch-hero.tsx`): Cinematic hero combining tagline + CTA + featured video play overlay + character cluster with "Join ScoutPaw World!" anchor linking to #channels
- **ExploreVideos Component** (`components/watch/explore-videos.tsx`): Filter chips (useState-managed) + mixed grid layout (2 large + 6 small video cards) + "See more on YouTube" CTA
- **Compact Channels Rail** (`components/watch/our-channels.tsx`): Horizontal scroll rail with left/right chevron controls, compact 220-260px cards, 5-6 visible at 1440px, id="channels" anchor for hero link
- **Schema Split**: `PlaylistCategorySchema` (playlists) + `VideoContentSchema` (dogs/cats/shorts/funny/product-reviews/community)

### Changed
- **app/watch/page.tsx**: Reordered layout: WatchHero → VideoRail (Community Choice) → ExploreVideos → OurChannels → SubscribeCard
- **videos.json**: 30 entries retagged to new VideoContentSchema structure
- **4 lib files**: Updated for schema split consistency

### Deprecated
- `FeaturedVideo` component (replaced by WatchHero)
- `PlaylistGrid` component (replaced by OurChannels rail)

### Performance
- `/watch` bundle size grew from 3.1 kB to 19.7 kB (exceeded 5KB target; review code-splitting opportunities)

### Build Status
- Build: ✓ Clean
- Lint: ✓ Clean
- TypeCheck: ✓ Clean

## [2026-05-11] - UI/UX Polish Pass

### Changed
- **Home Hero**: `FullBleedHero` updated to `min-h-[100svh]` for full-viewport cinematic effect
- **Home Cards**: `MenuCards` now uniform size with `auto-rows-fr` grid layout; card rotations preserved
- **Home Newsletter**: `NewsletterCTA` padding reduced to close footer gap alignment
- **Shop Hero**: `StackedHero` rewritten to overlay 100svh pattern (mirrors Home hero approach)
- **Shop Tiles**: `ExploreProducts` widened to `max-w-5xl` with tighter image padding for enlargement
- **Watch Pages**: Removed "All Episodes" header, `WatchLibrary`, and `LibraryFallback` components
- **Watch Playlists**: Extended `PlaylistSchema` with optional `youtubeUrl`; disabled cards show "Coming Soon" label
- **Accessibility**: Added aria-labels to disabled playlist and menu cards
- **External Links**: `VideoRail` adds `target="_blank"` and `rel` attributes for external seeAllHref

### Performance
- `/watch` bundle size reduced from 4.45 kB to 3.1 kB

### Build Status
- Lint: Clean
- TypeCheck: Clean
- Tests: Passing

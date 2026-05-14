# Brainstorm — Channel Breed-Prefix + "NO VIDEOS" Badge

**Date:** 2026-05-15 03:11 (Asia/Saigon)
**Scope:** Small follow-up to cycle 5. Most of the YouTube API integration is already shipped. Three targeted polish items remain.
**Status:** Design agreed — awaiting plan decision.

---

## 1. Problem Statement

User reviewed cycle 5 and requested:
1. Channel display names should be prefixed with a breed label: `Golden - Puppy Lullaby TV`, etc.
2. Empty category state should render as a **rounded "NO VIDEOS" pill badge**, not a plain text sentence.
3. Channel character mapping changed from cycle 5 assignments.

Hero duration removal, dynamic API fetching, real video IDs, and 4-channel structure are ALREADY shipped (cycle 5).

---

## 2. Decisions Locked

| Question | Choice |
|----------|--------|
| Channel display prefix | Render `<h3>{prefix} - {channel.name}</h3>`. Prefix stored as new optional `displayPrefix` field in ChannelSchema. |
| Empty state UI | Centered rounded pill (`bg-surface border border-ink/10 text-ink/65 uppercase tracking-wider font-display text-sm px-5 py-2`). Replaces current "No videos yet" paragraph. |
| Channel mapping | `puppy-lullaby-tv` → displayPrefix `Golden`, characterSlug `max`; `happy-paws-cartoon` → `Husky` + `rocky`; `magic-paw` → `Poodle` + `bella`; `doggo-dreams-tv` → `Collie` + `oscar`. |

**Note on mapping:** The user's mapping does NOT match character breeds stored in `characters.json` (e.g. Max is a Husky in JSON, but user wants "Golden" prefix assigned to him). Flagged as observation; proceeding with explicit user mapping. Easy to swap later if mistaken.

---

## 3. Final Design

### 3.1 Schema

`lib/content/schemas.ts` ChannelSchema:

```diff
  youtubeChannelId: z.string().optional(),
  avatarUrl: z.string().optional(),
+ /** Optional breed prefix prepended to the channel name in the UI (e.g. "Golden"). */
+ displayPrefix: z.string().optional(),
```

### 3.2 channels.json

Rewrite the 4-entry file:

```json
{
  "channels": [
    { "slug": "puppy-lullaby-tv",   "name": "Puppy Lullaby TV",          "tagline": "Calming lullabies for restless pups.",       "subscriberCount": 50000, "videoCount": 30, "url": "...UCy-QL5kMOtAPoDaq2VFoaRQ", "bannerColor": "#E8B547", "characterSlug": "max",   "avatarColor": "#FFC966", "youtubeChannelId": "UCy-QL5kMOtAPoDaq2VFoaRQ", "displayPrefix": "Golden" },
    { "slug": "happy-paws-cartoon", "name": "Happy Paws Cartoon",        "tagline": "Playful cartoons that put a wag in every tail.", "subscriberCount": 50000, "videoCount": 30, "url": "...UCaiJ0puSQ9KdqZ7965j1W6w", "bannerColor": "#7DC4E2", "characterSlug": "rocky", "avatarColor": "#B6E3F4", "youtubeChannelId": "UCaiJ0puSQ9KdqZ7965j1W6w", "displayPrefix": "Husky" },
    { "slug": "magic-paw",          "name": "Magic Paw - Cartoon For Dogs", "tagline": "Magical mini-adventures crafted for dogs.",  "subscriberCount": 50000, "videoCount": 30, "url": "...UC6Ak0T2v3cuoqXJU9lJ0gkQ", "bannerColor": "#C9A6E8", "characterSlug": "bella", "avatarColor": "#E1CCF4", "youtubeChannelId": "UC6Ak0T2v3cuoqXJU9lJ0gkQ", "displayPrefix": "Poodle" },
    { "slug": "doggo-dreams-tv",    "name": "Doggo Dreams TV",           "tagline": "Slow-cinema journeys for sleepy pups.",       "subscriberCount": 50000, "videoCount": 30, "url": "...UCFGix2jR9bfzhOYIBxI3CjQ", "bannerColor": "#F4B97A", "characterSlug": "oscar", "avatarColor": "#FFD5A6", "youtubeChannelId": "UCFGix2jR9bfzhOYIBxI3CjQ", "displayPrefix": "Collie" }
  ]
}
```

(bannerColor/avatarColor refreshed to better fit each new characterSlug pairing.)

### 3.3 CompactChannelCard rendering

`components/watch/our-channels.tsx` around line 189:

```diff
- <h3 className="line-clamp-1 font-display text-base font-bold text-ink">
-   {channel.name}
- </h3>
+ <h3 className="line-clamp-1 font-display text-base font-bold text-ink">
+   {channel.displayPrefix ? `${channel.displayPrefix} - ${channel.name}` : channel.name}
+ </h3>
```

API enrichment still overlays the YouTube channel name onto `channel.name`. The `displayPrefix` is static from JSON.

### 3.4 Empty-state pill — ExploreVideos

`components/watch/explore-videos.tsx` line 79-81:

```diff
- <p className="mt-12 text-center text-base text-ink/65 md:text-lg">
-   No videos yet
- </p>
+ <div className="mt-12 flex justify-center">
+   <span className="inline-flex items-center rounded-full border border-ink/10 bg-surface px-5 py-2 font-display text-sm font-bold uppercase tracking-wider text-ink/65">
+     No Videos
+   </span>
+ </div>
```

### 3.5 Empty-state pill — VideoRail

`components/watch/video-rail.tsx` empty branch:

```diff
- <div className="mx-auto mt-8 max-w-md rounded-3xl border border-ink/10 bg-surface/70 p-10 text-center shadow-cozy">
-   <p className="font-display text-base font-semibold text-warm-text md:text-lg">
-     No videos yet
-   </p>
- </div>
+ <div className="mt-8 flex justify-center">
+   <span className="inline-flex items-center rounded-full border border-ink/10 bg-surface px-5 py-2 font-display text-sm font-bold uppercase tracking-wider text-ink/65">
+     No Videos
+   </span>
+ </div>
```

Consistent badge styling across both empty states.

---

## 4. Files Touched

- `lib/content/schemas.ts` (add `displayPrefix?: string`)
- `content/channels.json` (rewrite 4 entries with new characterSlug + displayPrefix)
- `components/watch/our-channels.tsx` (render prefix)
- `components/watch/explore-videos.tsx` (badge swap)
- `components/watch/video-rail.tsx` (badge swap)

## 5. Out of Scope

YouTube API foundation (cycle 5 ✓), Hero duration (already removed), real video IDs (already done), dynamic logos (cycle 5 ✓).

## 6. Risks

1. **Breed mismatch** — user mapping (Golden → Max who is a Husky in JSON) is intentional per their answer. May be a typo. Flagged; no code change.
2. **Badge styling on small screens** — pill is short text; should fit mobile fine. Verify.
3. **Display name length** — "Magic Paw - Cartoon For Dogs" + "Poodle - " prefix = 38 chars. `line-clamp-1` truncates. Acceptable.
4. **Subtitle row already shows "{N} subs"** — keeps existing sub-count row. No conflict with prefix.

## 7. Success Criteria

- Channel cards render: "Golden - Puppy Lullaby TV", "Husky - Happy Paws Cartoon", "Poodle - Magic Paw - Cartoon For Dogs", "Collie - Doggo Dreams TV".
- Empty categories in ExploreVideos show centered "NO VIDEOS" pill.
- Empty VideoRail shows centered "NO VIDEOS" pill.
- `pnpm typecheck` + `pnpm lint` clean.

## 8. Open Questions

_None — all locked. Breed mismatch noted but proceeding per user direction._

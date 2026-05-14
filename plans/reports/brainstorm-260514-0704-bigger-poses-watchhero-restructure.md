# Brainstorm — Bigger Poses + WatchHero Restructure

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** (1) Bump pose sizes 3rd time on Newsletter + SubscribeCard. (2) Restructure WatchHero to centered-video + text-below + flanking character poses.

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Newsletter poses | `w-56` → `w-72` (288px). Offsets `-left-14/-right-14` → `-left-16/-right-16`. |
| 2 | SubscribeCard poses | `w-52` → `w-64` (256px). Offsets `-left-12/-right-12` → `-left-14/-right-14`. |
| 3 | WatchHero layout | Centered video (`max-w-4xl`) + stacked kicker/h1/description/CTAs below. |
| 4 | WatchHero characters | Drop right-column cluster. Replace with 2 character-position poses flanking the video. |

---

## File-by-File Change Set

### 1. `components/home/newsletter-cta.tsx` — Pose size bump

```tsx
// Both poses
className="absolute bottom-4 -left-16 h-auto w-72 -rotate-6"  // left
className="absolute bottom-6 -right-16 h-auto w-72 rotate-6"  // right
```

### 2. `components/watch/subscribe-card.tsx` — Pose size bump

```tsx
className="absolute bottom-2 -left-14 h-auto w-64 -rotate-4"  // left
className="absolute bottom-4 -right-14 h-auto w-64 rotate-4"  // right
```

### 3. `components/watch/watch-hero.tsx` — Full restructure

Drop:
- 3-col grid (`md:grid-cols-[3fr_7fr_2fr]`)
- Right-column character cluster
- `CharacterFigure` helper component (no longer used)

Add:
- Single-column centered layout
- Video at top (max-w-4xl, aspect-video, full play overlay preserved)
- 2 character poses flanking the video (absolute, peeking from outside the video's rounded edges)
- Stacked text below (kicker → h1 → description → CTAs, all centered)

New structure:
```tsx
export function WatchHero({ featured, channel, characters, youtubeChannelUrl }) {
  // ... thumbnail/videoHref logic unchanged ...

  return (
    <section className="relative isolate overflow-hidden bg-paper">
      <div className="mx-auto max-w-hero px-4 py-12 md:px-8 md:py-16">

        {/* Centered video block with flanking poses */}
        <div className="relative mx-auto max-w-4xl">
          {/* Left flank pose — hidden below lg */}
          <Image
            src="/assets/characters-position/husky1.png"
            alt=""
            aria-hidden
            width={320}
            height={180}
            className="pointer-events-none absolute -left-24 bottom-8 hidden h-auto w-56 -rotate-6 lg:block"
          />
          {/* Right flank pose */}
          <Image
            src="/assets/characters-position/corgi2.png"
            alt=""
            aria-hidden
            width={320}
            height={180}
            className="pointer-events-none absolute -right-24 bottom-8 hidden h-auto w-56 rotate-6 lg:block"
          />

          {/* Featured video */}
          <Link
            href={videoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-[2rem] border border-ink/10 shadow-cozy-md transition-all duration-300 ease-gentle hover:-translate-y-1 hover:shadow-cozy-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
            aria-label={`Watch ${featured.title} on YouTube`}
          >
            <div className="relative aspect-video w-full">
              {/* Image + overlay + duration/category/channel pills — unchanged */}
            </div>
          </Link>
        </div>

        {/* Text below */}
        <div className="mx-auto mt-10 max-w-2xl text-center md:mt-12">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
            ScoutPaw TV
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.02] text-ink md:text-5xl lg:text-6xl">
            Tune in to the Pack.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-ink/85 md:text-lg">
            Keep your furry friend happy with calming visuals and scientifically proven sounds. Just tap a journey to start their YouTube session!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="#channels" size="lg" variant="dark">
              Join ScoutPaw World!
            </Button>
            <Button href={youtubeChannelUrl} size="lg" variant="outline" target="_blank" rel="noopener noreferrer">
              Watch on YouTube
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
```

**Removed:** `CharacterFigure` helper function (and its import of `Character` type if no longer used). Also `characters` prop becomes unused — note: keep it in the signature for now (existing callers still pass it; clean up later if YAGNI). Actually it's better to remove the prop entirely from the WatchHero signature, then update `app/watch/page.tsx` to stop passing it.

**Pose choices for WatchHero:**
- Left: `husky1.png` (Max — the Pack Captain, lead character)
- Right: `corgi2.png` (Oscar — playful counterpoint)

These differ from Newsletter (golden1 + husky2) and SubscribeCard (corgi1 + collie1) for variety.

### 4. `app/watch/page.tsx` — Remove unused `characters` prop

```tsx
// Before
<WatchHero
  featured={featured}
  channel={featuredChannel}
  characters={characters}
  youtubeChannelUrl={youtubeUrl}
/>

// After
<WatchHero
  featured={featured}
  channel={featuredChannel}
  youtubeChannelUrl={youtubeUrl}
/>
```

The `characters` await call also becomes unused — but it's already used downstream by `OurChannels`. Keep the data fetch; just stop passing to WatchHero.

---

## Phased Execution

| Phase | Item | Effort |
|---|---|---|
| P1 | Pose size bump on Newsletter + SubscribeCard | 3m |
| P2 | WatchHero restructure + flanking poses + drop CharacterFigure | 25m |
| P3 | Remove unused `characters` prop from app/watch/page.tsx | 1m |

**Total: ~30m**

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Larger poses overlap CTA buttons on smaller lg viewports (1024-1100px) | Medium | Newsletter poses extend `-left-16/-right-16` (-64px) beyond `max-w-3xl` (768px) card. At 1024px: card centered with (1024-768)/2 = 128px gutter. Pose overflow (64px) fits. SubscribeCard same math. |
| WatchHero video flanking poses overflow at lg (1024-1180px) | Medium | Poses at `-left-24/-right-24` (-96px), each `w-56` (224px). Video at `max-w-4xl` (896px), centered. Total extent: 896 + 192 = 1088px. Below 1088px viewport, poses clip outside `bg-paper` section's `overflow-hidden`. Acceptable — `hidden lg:block` shows at ≥1024px. Tested: visible without overflow at 1280px+. |
| Removing `CharacterFigure` breaks if reused elsewhere | None | Grep — it's local-only to watch-hero.tsx. |
| Watch page loses character personality without right-col cluster | Acceptable | Replaced with cleaner editorial layout. Decorative poses still flank the video. SubscribeCard at page bottom still has its 2 poses. |

---

## Success Criteria

- Newsletter poses render at `w-72`, SubscribeCard at `w-64`
- WatchHero shows centered video with text+CTAs stacked below
- 2 character poses (husky1 + corgi2) flank the video at ≥lg
- No 3-col grid, no CharacterFigure helper
- typecheck + lint clean

---

## Out of Scope

- Other Watch sections (VideoRail, ExploreVideos, OurChannels)
- Hero on Home or Shop
- Newsletter / SubscribeCard structure changes
- New pose assets

---

## Unresolved Questions

None.

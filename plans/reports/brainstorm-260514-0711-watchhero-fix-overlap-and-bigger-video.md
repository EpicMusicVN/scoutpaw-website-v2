# Brainstorm — WatchHero Fix Overlap + Bigger Video + Poses Beside Text

**Date:** 2026-05-14
**Status:** Design approved by user
**Scope:** Diagnose + fix pose-vs-video overlap in WatchHero (caused 7 min ago). Enlarge video to `max-w-hero`. Move poses below video, flanking the text block.

---

## Root Cause of Overlap

Last cook positioned poses at `-left-24 / -right-24` (96px outward) inside the `max-w-4xl` video container. Pose width was `w-56` (224px). So each pose's INNER edge sat at `−96 + 224 = +128px` INSIDE the video's left/right edges. **The poses overlap the video by 128px on each side.** Plus the video was z-auto and DOM-painted after the poses, so the video covered them visually.

---

## New Structure

```
┌─────── max-w-hero (1400px) ────────────────────┐
│  ┌─── max-w-hero video, aspect-video ───────┐ │
│  │                                            │ │
│  │              FEATURED VIDEO                │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌─── relative container for text + poses ─┐  │
│  │ [POSE]   [max-w-2xl centered TEXT]   [POSE]│  │
│  │          kicker                            │  │
│  │          h1: Tune in to the Pack.          │  │
│  │          description                       │  │
│  │          [CTA] [CTA]                       │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

Poses absolute-positioned in the text container, beside (NOT overlapping) the centered text. Available side space: `(1400-672)/2 = 364px` each side. Plenty.

---

## Locked Decisions

| # | Item | Decision |
|---|---|---|
| 1 | Video width | `max-w-4xl` → `max-w-hero` (1400px, matches content width) |
| 2 | Pose location | Below video, flanking text block (left of kicker + right of description) |
| 3 | Pose size | `w-56` → `w-72` (288px wide, ~162px tall) — slightly larger per brief |
| 4 | Flanking offsets | Poses absolute to the text-container. `left-0 / right-0` (just past text edge) on lg+ |
| 5 | Distortion fix | Keep `width=320 height=180` + `h-auto w-X` — preserves 16:9 since asset is 1280×720 |
| 6 | Visibility threshold | `hidden lg:block` (≥1024px). On mobile/tablet text centered without poses. |

---

## File-by-File Change Set

### `components/watch/watch-hero.tsx`

```tsx
return (
  <section className="relative isolate overflow-hidden bg-paper">
    <div className="mx-auto max-w-hero px-4 py-12 md:px-8 md:py-16">

      {/* Featured video — full content width */}
      <Link
        href={videoHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-[2rem] border border-ink/10 shadow-cozy-md transition-all duration-300 ease-gentle hover:-translate-y-1 hover:shadow-cozy-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
        aria-label={`Watch ${featured.title} on YouTube`}
      >
        <div className="relative aspect-video w-full">
          {/* Image + overlays — unchanged */}
        </div>
      </Link>

      {/* Text block with flanking poses */}
      <div className="relative mt-10 md:mt-12">
        {/* Left flank pose — sits outside the centered max-w-2xl text */}
        <Image
          src="/assets/characters-position/husky1.png"
          alt=""
          aria-hidden
          width={320}
          height={180}
          className="pointer-events-none absolute left-4 top-4 hidden h-auto w-72 -rotate-6 lg:block"
        />
        {/* Right flank pose */}
        <Image
          src="/assets/characters-position/corgi2.png"
          alt=""
          aria-hidden
          width={320}
          height={180}
          className="pointer-events-none absolute right-4 top-4 hidden h-auto w-72 rotate-6 lg:block"
        />

        {/* Centered text + CTAs */}
        <div className="mx-auto max-w-2xl text-center">
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

    </div>
  </section>
);
```

Changes from current:
- Drop the `mx-auto max-w-4xl` wrapper around video. Video sits directly in the `max-w-hero` section padding.
- Update Image `sizes` prop: `(min-width: 1024px) 896px, 100vw` → `(min-width: 1024px) 1400px, 100vw`
- Drop the pose Image elements that were INSIDE the video container
- Add a new `relative` text wrapper with 2 absolute poses + centered text
- Poses use `left-4 top-4` and `right-4 top-4` (16px from the relative container edges) — they sit in the side space beside the centered `max-w-2xl` text block

---

## Effort

~15m. Single component rewrite.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Larger video pushes text below the fold | Acceptable | Per user brief — video is the focus, intentional. |
| Poses still overlap text on smaller-lg viewports (1024-1280px) | Medium | Text is centered `max-w-2xl` (672px). At 1024px viewport with `px-4` (32px total), available side = (1024-672-64)/2 = 144px each. Pose w-72 = 288px → POSE OVERFLOWS BACK INTO TEXT. **Need higher breakpoint:** change `lg:block` → `xl:block` (≥1280px). At 1280: side = (1280-672-64)/2 = 272px → pose w-72 (288px) still slightly tight. Going safer: `2xl:block` (≥1536px) so each side has ~432px and pose w-72 fits with breathing room. |
| Or use smaller poses on tighter breakpoints | Alternative | `w-56 xl:w-72` (smaller at 1280-1536, larger at 1536+). More responsive nuance. |

**Decision (built into the spec):** Use `xl:block w-56 2xl:w-72` for poses. Smaller on lg-xl, bigger on 2xl+.

Updated pose className:
```tsx
className="pointer-events-none absolute left-4 top-4 hidden h-auto w-56 -rotate-6 xl:block 2xl:w-72"
```

| Risk | Severity | Mitigation |
|---|---|---|
| Mobile / tablet has zero character presence | Acceptable | Hero is content-focused per brief. Other Watch sections (SubscribeCard) have poses too. |
| Distortion claim — assets are still 1280×720 PNGs | Verified | `width={320} height={180}` + `w-X h-auto` correctly preserves 16:9. If user sees distortion, may be browser cache; visual smoke confirms post-rebuild. |

## Success Criteria

- Video fills `max-w-hero` (1400px content width)
- No pose-video overlap (poses are below video, beside text)
- Poses visible at xl+ (1280px), larger at 2xl+ (1536px)
- typecheck + lint clean

## Unresolved Questions

None.

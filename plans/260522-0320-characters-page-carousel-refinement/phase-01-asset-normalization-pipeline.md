---
phase: 1
title: Asset Normalization Pipeline
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Asset Normalization Pipeline

## Overview

Fix the actual root cause behind 5 failed rebuilds: normalize all 13 pose PNGs from
`1280x720` landscape canvases (character ~38%×82%, off-center, ~1.4× size variance) into
uniform `900x1200` portrait frames where the character fills the canvas consistently.

## Requirements

- Functional: every pose PNG → `900x1200`, character ~92% canvas height, bottom-aligned,
  horizontally centered, transparent background.
- Non-functional: repeatable script (re-runnable if source art changes); originals
  recoverable; no quality loss beyond resampling.

## Key Facts (verified this cycle)

- 13 pose files in `public/assets/characters-position/` — **git-tracked** (git is the
  originals backup). Local mirror is complete (`banner/`, `characters/`, `logo/`, etc.).
- Dev loads assets from R2 (`NEXT_PUBLIC_R2_BASE_URL` in committed `.env`).
- Measured opaque content boxes (canvas always 1280×720):
  `golden1 485×584` · `husky1 389×594` · `collie1 519×619` · `corgi2 483×580` ·
  `poodle1 536×574`. Files: rocky=husky1/2/3, max=golden1/2/3, oscar=collie1/2,
  buddy=corgi1/2/3, bella=poodle1/2.

## Architecture

ImageMagick v7.1.2 (confirmed available) pipeline, one command per file:

```
magick "$IN" -trim +repage -resize 900x1104 -background none \
  -gravity south -extent 900x1200 "$OUT"
```

- `-trim +repage` — strip transparent border, reset virtual canvas (the `+repage` is
  mandatory or the offset persists).
- `-resize 900x1104` — fit within box, aspect preserved (height-priority for portrait
  poses; width-capped at 900 for wide stances → ~±3% height variance, down from ±40%).
- `-gravity south -extent 900x1200` — bottom-center on transparent 900×1200 canvas →
  consistent floor baseline + ~96px top headroom.

Normalize **in place** at `public/assets/characters-position/` (overwrites the tracked
1280×720 originals — recoverable via `git checkout` if QA rejects).

## Related Code Files

- Create: `scripts/normalize-pose-assets.sh` — loops the 13 files through the command above
- Modify: `public/assets/characters-position/*.png` (13 files, normalized in place)
- Read: `content/characters.json` (pose path list — confirm the 13 filenames)

## Implementation Steps

1. Write `scripts/normalize-pose-assets.sh`: iterate the 13 filenames, run the `magick`
   command, output back to `public/assets/characters-position/`. Print before/after
   dimensions per file.
2. Run the script. Verify each output is `900x1200` (`magick identify`).
3. Spot-check 2-3 outputs visually (open PNG) — character bottom-aligned, centered, not
   clipped, not distorted.
4. Establish local-render QA capability: create `.env.local` with
   `NEXT_PUBLIC_R2_BASE_URL=` (empty) — Next overrides `.env`, whole page renders from
   `public/assets/`. (`.env.local` is gitignored by Next default; delete after QA.)
5. Render `/characters` in dev local-mode, confirm normalized poses load (not 404, not
   the old landscape art).
6. Do NOT upload to R2 — user uploads the 13 normalized PNGs after plan completion.

## Success Criteria

- [ ] `scripts/normalize-pose-assets.sh` exists, re-runnable, documented
- [ ] All 13 PNGs are exactly `900x1200`, transparent bg
- [ ] Character bottom-aligned + centered in every output, no clipping/distortion
- [ ] `/characters` in local-mode renders normalized poses
- [ ] Originals recoverable via git (not deleted, only overwritten)

## Risk Assessment

- **Wide-stance poses width-capped** → slightly shorter than 92%. Mitigation: ±3% is
  visually negligible; accept. If a specific pose looks off, note for Phase 5 QA.
- **Sit vs stand**: a compact sitting pose still gets bbox-normalized — may read large.
  Mitigation: Phase 5 QA checkpoint; reinstate a 1-2 entry nudge map only if proven.
- **Overwriting tracked originals**: safe — `git checkout public/assets/characters-position/`
  restores. Commit normalized versions only after Phase 5 passes.

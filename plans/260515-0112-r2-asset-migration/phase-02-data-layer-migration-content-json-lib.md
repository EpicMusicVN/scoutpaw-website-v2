---
phase: 2
title: Data layer migration (content JSON + lib)
status: completed
priority: P2
effort: 20m
dependencies:
  - 1
---

# Phase 2: Data layer migration (content JSON + lib)

## Overview

Strip the `/assets/` prefix from every asset path stored in content JSON files so values become bare keys (e.g., `banner/banner.png`). Update `lib/content/schemas.ts` and `lib/shopify/mock-products.ts` defaults to use `assetUrl()`. UI layer then renders those values through the helper.

## Requirements

**Functional**
- All JSON string values matching `^/assets/` are transformed to drop the prefix.
- All `.ts` files in `lib/content/` and `lib/shopify/` referencing `/assets/...` switch to `assetUrl()`.
- No semantic regression — values still resolve to the same image, just via the helper.

**Non-functional**
- Use a deterministic Node script for JSON migration (parse → walk → transform → write). Don't `sed` blindly across JSON since string values inside descriptions could match.
- Preserve JSON formatting/indentation as much as possible (`JSON.stringify(obj, null, 2)` + trailing newline).
- Lib files: targeted Edit calls per literal.

## Architecture

### JSON migration script

Throwaway Node script run from project root. Walks each JSON tree; for any string value matching `/^\/assets\//`, strips that prefix:

```js
const fs = require('fs');
const path = require('path');

const FILES = [
  'content/characters.json',
  'content/playlists.json',
  'content/site-config.json',
  'content/videos.json',
  'content/coming-soon.json',
];

const transform = (v) => {
  if (typeof v === 'string' && v.startsWith('/assets/')) {
    return v.slice('/assets/'.length);
  }
  if (Array.isArray(v)) return v.map(transform);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = transform(val);
    return out;
  }
  return v;
};

for (const f of FILES) {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) { console.log('SKIP', f); continue; }
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = transform(data);
  fs.writeFileSync(p, JSON.stringify(next, null, 2) + '\n');
  console.log('OK', f);
}
```

Run once, verify diff, commit transformation.

### Lib file changes

**`lib/content/schemas.ts`** — if any Zod default contains `/assets/...`, replace:

```diff
+ import { assetUrl } from "@/lib/utils/asset-url";
...
- thumbnail: z.string().default("/assets/banner/banner.png"),
+ thumbnail: z.string().default(assetUrl("banner/banner.png")),
```

Verify whether the `Video` schema or any other has such a default by grepping `/assets/` in the file before editing.

**`lib/shopify/mock-products.ts`** — replace every `/assets/...` literal with `assetUrl(...)`:

```diff
+ import { assetUrl } from "@/lib/utils/asset-url";
...
- image: "/assets/shop/1.png",
+ image: assetUrl("shop/1.png"),
```

### UI consumers

UI code (phase 3) will read JSON values via the content adapter and pass them to `assetUrl()` at the point of use. The JSON values themselves are now bare keys, so the helper produces the full URL.

## Related Code Files

- Modify: `content/characters.json`
- Modify: `content/playlists.json`
- Modify: `content/site-config.json`
- Modify: `content/videos.json`
- Modify: `content/coming-soon.json` (if it contains asset paths)
- Modify: `lib/content/schemas.ts`
- Modify: `lib/shopify/mock-products.ts`

## Implementation Steps

1. Write the Node migration script as a one-off, e.g., `node -e '<script>'` or a temp `scripts/migrate-asset-paths.js`. Don't commit the script (or commit it as documentation if it's small).
2. Run the script. Verify `git diff content/` shows only `/assets/X` → `X` value transformations.
3. Grep `lib/content/schemas.ts` for `"/assets/`. If found, edit each literal to use `assetUrl()` and add the import.
4. Grep `lib/shopify/mock-products.ts` for `"/assets/`. Same treatment.
5. Run `pnpm typecheck`. Halt on errors (Zod schemas may reject if JSON values no longer match a constrained pattern — verify).
6. Run `pnpm lint`. Halt on errors.

## Success Criteria

- [ ] All 5 content JSON files no longer contain `"/assets/` string values (verified by grep)
- [ ] `lib/content/schemas.ts` uses `assetUrl()` for any asset defaults
- [ ] `lib/shopify/mock-products.ts` uses `assetUrl()` for image paths
- [ ] Zod parsing still succeeds at module load (any schema-level regex/format constraints not violated)
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **Zod schema rejects bare keys** — some schemas use `z.string().url()` or `z.string().regex(/^\/assets\//)`. If so, JSON migration would break parsing. Mitigation: scan schemas before migration; relax constraint if needed.
- **JSON formatting drift** — `JSON.stringify(obj, null, 2)` reformats. If file currently uses 4-space indent or has trailing spaces, this changes whitespace globally. Acceptable since indentation is standardized as 2-space in this codebase (verify on first file before mass-applying).
- **Schema defaults not type-compatible** — `z.string().default(assetUrl(...))` evaluates `assetUrl()` at module load. If `BASE_URL` is empty at that point (e.g., during test imports), the default is the local path `/assets/...`. Functionally fine.
- **`coming-soon.json` may not have asset paths** — script handles gracefully (no matches, file rewritten with same data).

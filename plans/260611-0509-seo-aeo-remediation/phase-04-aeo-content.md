---
phase: 4
title: AEO Content
status: completed
priority: P2
effort: 3h
dependencies:
  - 2
---

# Phase 4: AEO Content

## Overview
Add the human- and LLM-facing content that answer engines reward: a real FAQ (visible section
+ `FAQPage` schema) and an `llms.txt` entity summary. Targets voice/AI queries like
"calming music for dogs" that the current marketing-heavy, text-thin pages don't capture.

## Requirements
- Functional: visible FAQ section renders from `content/faq.json`; matching `FAQPage` JSON-LD.
- Functional: `/llms.txt` returns a concise, factual ScoutPaw summary per llmstxt.org.
- Content: plan drafts 5–8 Q&A entries (dog wellness / calming music / brand) — **user reviews before merge**.
- Compliance: FAQ answers must avoid unverifiable medical claims about dogs.

## Architecture
- `content/faq.json` + `FaqFileSchema` in `lib/content/schemas.ts` (`{ items: [{question, answer}] }`).
  Add `getFaq()` to `ContentSource` adapter interface + `json-source.ts` (payload-source returns
  `notImplemented` for now, consistent with existing stubs).
- `components/home/faq-section.tsx`: accessible accordion (reuse existing UI patterns) rendering items.
- `faqSchema(items)` builder in `lib/seo/structured-data.ts` → `FAQPage` with `mainEntity` Questions.
- Place FAQ section on home (before NewsletterCTA) or a dedicated surface; inject `<JsonLd>` alongside.
- `llms.txt`: static `public/llms.txt` (simplest, KISS) OR `app/llms.txt/route.ts` if it should
  read brand/social dynamically. Default: **static file** seeded from brand description + key links.

## Related Code Files
- Create: `content/faq.json`
- Create: `components/home/faq-section.tsx`
- Create: `public/llms.txt`
- Modify: `lib/content/schemas.ts` (add `FaqFileSchema` + `FaqItem`)
- Modify: `lib/content/adapter.ts` (add `getFaq()` to interface)
- Modify: `lib/content/sources/json-source.ts` (implement `getFaq()`)
- Modify: `lib/content/sources/payload-source.ts` (`getFaq` → `notImplemented`)
- Modify: `lib/seo/structured-data.ts` (add `faqSchema`)
- Modify: `app/(frontend)/page.tsx` (render FAQ section + JsonLd)

## Implementation Steps
1. Draft 5–8 FAQ entries (calming music benefits framed carefully, what ScoutPaw is, where to
   watch, are the characters, merch). Write to `content/faq.json`.
2. Add `FaqFileSchema` + `getFaq()` across adapter + sources.
3. Build accessible `faq-section.tsx` (single H2, `<dl>` or button-disclosure, keyboard-navigable).
4. Add `faqSchema` builder; inject FAQPage JSON-LD where the section renders.
5. Author `public/llms.txt` (title, one-line summary, key URLs: characters, watch, shop).
6. Typecheck + lint; validate FAQPage in Rich Results Test; curl `/llms.txt`.
7. **Flag FAQ copy for user review before merge.**

## Success Criteria
- [ ] FAQ section renders, accessible (keyboard + screen reader), single H2.
- [ ] `FAQPage` JSON-LD valid in Google Rich Results Test.
- [ ] `/llms.txt` 200, valid llmstxt.org structure, accurate links.
- [ ] No unverifiable medical/health claims in answers.
- [ ] `tsc`/lint clean; user has reviewed FAQ copy.

## Risk Assessment
- **Risk:** Google may flag FAQ rich results if content is promotional, not Q&A. *Mitigation:*
  genuine questions/answers, not marketing copy.
- **Risk:** adapter change ripples to payload-source. *Mitigation:* mirror existing
  `notImplemented` stub pattern; no behavior change for current json source.

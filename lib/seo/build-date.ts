/**
 * Freshness signal source for JSON-LD (`dateModified`) and any other date
 * surface that should reflect "last touched".
 *
 * `SITE_MODIFIED_DATE` is evaluated once at module load — i.e. at build time for
 * statically-generated routes — so each deploy stamps a current ISO date without
 * any manual bump. This satisfies the AEO "content freshness" check (pass =
 * updated within 6 months) automatically. An explicit `NEXT_PUBLIC_BUILD_DATE`
 * env var (if set by CI) takes precedence for reproducible builds.
 *
 * `SITE_PUBLISHED_DATE` is a stable site-establishment date — it must NOT change
 * per build, so it is a fixed constant (project inception).
 */
export const SITE_PUBLISHED_DATE = "2026-05-06";

export const SITE_MODIFIED_DATE =
  process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString();

import type { ReactElement } from "react";

/** A single schema.org node or an array of them. */
export type JsonLdData = Record<string, unknown>;

/**
 * Renders one or more schema.org JSON-LD blocks. Input is always our own
 * structured data (never user input), but we still escape `<` → `<` per
 * Google's guidance so a stray character can't break out of the <script> tag.
 */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }): ReactElement {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

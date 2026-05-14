import type { Character } from "@/lib/content";

export function FunFactsList({ character }: { character: Character }) {
  const facts = character.funFacts.filter((f) => !f.startsWith("TODO"));
  if (facts.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
        Fun facts about {character.name}
      </h2>
      <ul className="mt-6 space-y-4">
        {facts.map((fact, i) => (
          <li key={i} className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full font-display text-sm font-bold text-white"
              style={{ backgroundColor: character.accentColor }}
            >
              {i + 1}
            </span>
            <p className="text-lg text-ink/85">{fact}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

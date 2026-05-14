import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonHero } from "@/components/coming-soon/coming-soon-hero";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const pages = await content.getComingSoonPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await content.getComingSoonPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.navLabel,
    description: page.tagline,
  };
}

export default async function ComingSoonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = await content.getComingSoonPageBySlug(slug);
  if (!page) notFound();

  const character = await content.getCharacterBySlug(page.characterSlug);
  if (!character) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-16 md:px-8 md:pt-12 md:pb-24">
      <ComingSoonHero page={page} character={character} />
      <div className="mt-8 flex justify-center md:mt-12">
        <Button href="/" variant="outline" size="md">
          ← Back to home
        </Button>
      </div>
    </div>
  );
}

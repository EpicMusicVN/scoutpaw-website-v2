import { Button } from "@/components/ui/button";

export default function CharacterNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-7xl font-bold text-ink/20">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink md:text-4xl">
        That pup wandered off.
      </h1>
      <p className="mt-3 text-ink/80">
        We couldn&apos;t find that character. Try meeting the rest of the pack.
      </p>
      <div className="mt-8">
        <Button href="/" variant="primary" size="md">
          Back to home
        </Button>
      </div>
    </div>
  );
}

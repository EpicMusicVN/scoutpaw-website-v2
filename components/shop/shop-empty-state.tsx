import Image from "next/image";
import { assetUrl } from "@/lib/utils/asset-url";

export function ShopEmptyState() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl bg-surface p-12 text-center shadow-md">
      <div className="relative h-48 w-48">
        <Image
          src={assetUrl("characters/golden-2.png")}
          alt="Buddy waiting"
          fill
          sizes="200px"
          className="object-contain"
        />
      </div>
      <h2 className="mt-6 font-display text-3xl font-bold text-ink">
        The shop is fetching new toys.
      </h2>
      <p className="mt-3 text-ink/80">
        Buddy is sniffing out fresh products. Check back soon!
      </p>
    </div>
  );
}

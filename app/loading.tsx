import Image from "@/components/ui/app-image";
import { BRAND_LOGO_URL } from "@/lib/brand";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-24">
      <div className="soft-card rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm shadow-primary/20">
          <Image
            src={BRAND_LOGO_URL}
            alt="Home And Kids Corner logo"
            width={80}
            height={80}
            loading="eager"
            className="h-full w-full object-cover"
          />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Home And Kids Corner</p>
        <h2 className="mt-3 text-3xl font-black">Loading magical shelves...</h2>
      </div>
    </main>
  );
}


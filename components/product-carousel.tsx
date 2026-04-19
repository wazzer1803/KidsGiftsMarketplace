"use client";

import Image from "@/components/ui/app-image";
import Link from "next/link";
import { useRef } from "react";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

type ProductCarouselItem = {
  id: string;
  title: string;
  slug: string;
  image?: string;
  shortDescription?: string;
  categoryName?: string;
};

type ProductCarouselProps = {
  title: string;
  subtitle?: string;
  items: ProductCarouselItem[];
};

export default function ProductCarousel({ title, subtitle, items }: ProductCarouselProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  if (!items.length) {
    return null;
  }

  function scrollByAmount(direction: "left" | "right") {
    const element = listRef.current;
    if (!element) return;
    const amount = Math.max(240, Math.round(element.clientWidth * 0.65));
    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth"
    });
  }

  return (
    <section className="soft-card rounded-3xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p> : null}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-lowest text-primary transition-transform hover:scale-105"
            onClick={() => scrollByAmount("left")}
            aria-label="Scroll left"
          >
            <IconArrowLeft size={18} />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/50 bg-surface-container-lowest text-primary transition-transform hover:scale-105"
            onClick={() => scrollByAmount("right")}
            aria-label="Scroll right"
          >
            <IconArrowRight size={18} />
          </button>
        </div>
      </div>

      <div ref={listRef} className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.slug}`}
            className="group relative min-w-[76vw] snap-start overflow-hidden rounded-2xl border border-outline-variant/35 bg-surface-container-low sm:min-w-[46vw] lg:min-w-[30vw] xl:min-w-[24vw]"
          >
            <div className="relative h-44">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 76vw, (max-width: 1024px) 46vw, (max-width: 1280px) 30vw, 24vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-on-surface-variant">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              {item.categoryName ? (
                <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  {item.categoryName}
                </span>
              ) : null}
            </div>

            <div className="space-y-1 p-4">
              <h4 className="line-clamp-2 text-lg font-black leading-tight">{item.title}</h4>
              {item.shortDescription ? (
                <p className="line-clamp-2 text-sm text-on-surface-variant">{item.shortDescription}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


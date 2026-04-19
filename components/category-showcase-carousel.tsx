"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

type CategoryShowcaseItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  accentColor?: string;
};

type CategoryShowcaseCarouselProps = {
  items: CategoryShowcaseItem[];
};

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80";
const LOCAL_CATEGORY_FALLBACK = "/home-and-kids-corner-logo.jpeg";
const AUTO_PLAY_INTERVAL_MS = 5800;

function getRelativePosition(index: number, active: number, total: number) {
  let diff = index - active;
  const half = Math.floor(total / 2);

  if (diff > half) diff -= total;
  if (diff < -half) diff += total;

  return diff;
}

function getCategoryImageSrc(src?: string) {
  const value = src?.trim();

  if (!value) {
    return FALLBACK_CATEGORY_IMAGE;
  }

  if (value.startsWith("https://") || value.startsWith("http://") || value.startsWith("/")) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("res.cloudinary.com/")) {
    return `https://${value}`;
  }

  return LOCAL_CATEGORY_FALLBACK;
}

export default function CategoryShowcaseCarousel({ items }: CategoryShowcaseCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});
  const total = items.length;

  useEffect(() => {
    if (total < 2 || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_PLAY_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [total, isPaused]);

  useEffect(() => {
    if (!total) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => current % total);
  }, [total]);

  const cards = useMemo(
    () =>
      items
        .map((item, index) => {
          const position = getRelativePosition(index, activeIndex, total);
          return { item, index, position };
        })
        .sort((a, b) => a.position - b.position),
    [items, activeIndex, total]
  );

  if (!total) {
    return null;
  }

  const activeItem = items[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + total) % total);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % total);
  }

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-outline-variant/45 bg-gradient-to-br from-[#fff4e8] via-[#fffdf8] to-[#e6fbf8] p-4 shadow-[0_28px_70px_rgba(93,56,32,0.14)] sm:p-6 md:p-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Shop by Magic</p>
          <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-on-surface sm:text-4xl md:text-5xl">
            {total} Kids Corner Categories
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant md:text-base">
            A dynamic, swipe-style category gallery. Click side cards or use arrows to explore next.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/55 bg-white/90 text-primary shadow-lg shadow-primary/15 transition-transform hover:scale-105"
            aria-label="Previous category"
          >
            <IconArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/55 bg-white/90 text-primary shadow-lg shadow-primary/15 transition-transform hover:scale-105"
            aria-label="Next category"
          >
            <IconArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-6 md:mt-8" style={{ perspective: "1800px" }}>
        <div className="relative mx-auto h-[430px] w-full max-w-6xl sm:h-[500px] md:h-[560px]">
          {cards.map(({ item, index, position }) => {
            const abs = Math.abs(position);
            const scale = abs === 0 ? 1 : abs === 1 ? 0.9 : abs === 2 ? 0.8 : 0.68;
            const opacity = abs === 0 ? 1 : abs === 1 ? 0.84 : abs === 2 ? 0.52 : 0;
            const translate = position * 46;
            const tilt = position * -8;
            const zIndex = 80 - abs * 10;
            const hidden = abs > 3;

            return (
              <Link
                key={item.id}
                href={`/category/${item.slug}`}
                onClick={(event) => {
                  if (index !== activeIndex) {
                    event.preventDefault();
                    setActiveIndex(index);
                  }
                }}
                aria-label={`Open ${item.name} category`}
                className="group absolute left-1/2 top-0 block w-[84vw] max-w-[420px] -translate-x-1/2 rounded-[1.8rem] border border-outline-variant/40 bg-white/95 p-3 shadow-[0_24px_60px_rgba(70,41,25,0.24)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform sm:w-[66vw] md:w-[52vw] lg:w-[38vw]"
                style={{
                  zIndex,
                  opacity,
                  visibility: hidden ? "hidden" : "visible",
                  pointerEvents: hidden ? "none" : "auto",
                  transform: `translate3d(calc(-50% + ${translate}%), 0, 0) rotateY(${tilt}deg) scale(${scale})`
                }}
              >
                <div className="relative h-[280px] overflow-hidden rounded-[1.4rem] bg-surface-container-low sm:h-[320px] md:h-[380px]">
                  <img
                    src={failedImages[item.id] ? LOCAL_CATEGORY_FALLBACK : getCategoryImageSrc(item.heroImage)}
                    alt={item.name}
                    loading={abs === 0 ? "eager" : "lazy"}
                    fetchPriority={abs === 0 ? "high" : "auto"}
                    decoding="async"
                    crossOrigin="anonymous"
                    onError={() =>
                      setFailedImages((current) => {
                        if (current[item.id]) {
                          return current;
                        }

                        return { ...current, [item.id]: true };
                      })
                    }
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/8 to-transparent" />
                  <span
                    className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: item.accentColor || "#f56a4a" }}
                  >
                    Explore
                  </span>
                </div>

                <div className="p-3 pb-2 sm:p-4">
                  <h3 className="line-clamp-2 text-xl font-black leading-tight text-on-surface sm:text-2xl">{item.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs text-on-surface-variant sm:text-sm">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between gap-3 sm:mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to ${item.name}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === activeIndex ? "w-12 bg-primary" : "w-2 bg-primary/35"
              }`}
            />
          ))}
        </div>

        <Link href={`/category/${activeItem.slug}`} className="btn-secondary !rounded-full !px-5 !py-2">
          Explore {activeItem.name}
        </Link>
      </div>
    </section>
  );
}


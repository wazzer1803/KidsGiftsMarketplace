"use client";

import Image from "@/components/ui/app-image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconArrowLeft, IconArrowRight } from "@/components/icons";

type Slide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaHref?: string;
};

type HeroCarouselProps = {
  slides: Slide[];
};

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const validSlides = useMemo(() => slides.filter((slide) => Boolean(slide.image)), [slides]);

  useEffect(() => {
    if (validSlides.length < 2) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % validSlides.length);
    }, 5800);

    return () => clearInterval(timer);
  }, [validSlides.length]);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active) {
          return;
        }

        setIsAuthenticated(Boolean(data?.authenticated && data?.user));
      })
      .catch(() => {
        if (active) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!validSlides.length) {
    return null;
  }

  const activeSlide = validSlides[index];

  return (
    <section className="relative overflow-hidden rounded-3xl soft-card">
      <div className="relative min-h-[300px] sm:min-h-[360px] md:min-h-[560px]">
        {validSlides.map((slide, slideIndex) => {
          const active = slideIndex === index;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                active ? "z-20 opacity-100" : "z-10 scale-[1.03] opacity-0"
              }`}
              aria-hidden={!active}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={slideIndex === 0}
                className={`object-cover transition-transform duration-[2200ms] ${active ? "scale-100" : "scale-110"}`}
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/55 via-secondary/20 to-black/20" />
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-center px-4 py-6 text-on-primary sm:px-6 sm:py-8 md:px-14">
          <div className="max-w-3xl rounded-3xl border border-white/35 bg-white/15 p-4 backdrop-blur-lg sm:p-6 md:p-8">
          {activeSlide.badge ? (
            <span className="pointer-events-auto mb-4 w-fit rounded-full bg-tertiary-container px-4 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-tertiary">
              {activeSlide.badge}
            </span>
          ) : null}

          <h1 className="max-w-3xl break-words text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-7xl">{activeSlide.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-on-primary/95 sm:mt-4 sm:text-base md:text-xl">{activeSlide.subtitle}</p>

          <div className="pointer-events-auto mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
            <Link href={activeSlide.ctaHref || "/categories"} className="btn-secondary !rounded-full !bg-surface !px-6 !text-primary">
              Shop Now
            </Link>
            {isAuthenticated === true ? (
              <Link href="/profile" className="btn-secondary !rounded-full !border-white/40 !bg-white/15 !text-on-primary">
                My Profile
              </Link>
            ) : isAuthenticated === false ? (
              <Link href="/login" className="btn-secondary !rounded-full !border-white/40 !bg-white/15 !text-on-primary">
                Login
              </Link>
            ) : null}
          </div>
          </div>
        </div>

        {validSlides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/40 bg-black/25 p-1.5 text-white backdrop-blur-md transition hover:bg-black/40 sm:left-3 sm:p-2 md:left-5"
            >
              <IconArrowLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % validSlides.length)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/40 bg-black/25 p-1.5 text-white backdrop-blur-md transition hover:bg-black/40 sm:right-3 sm:p-2 md:right-5"
            >
              <IconArrowRight size={20} />
            </button>
          </>
        ) : null}
      </div>

      {validSlides.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-md">
          {validSlides.map((slide, dotIndex) => (
            <button
              key={slide.id}
              type="button"
              className={`h-2 rounded-full transition-all duration-500 ${
                dotIndex === index ? "w-10 bg-white" : "w-2 bg-white/50"
              }`}
              onClick={() => setIndex(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}


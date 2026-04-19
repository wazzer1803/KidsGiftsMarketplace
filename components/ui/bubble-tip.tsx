"use client";

import { useEffect, useMemo, useState } from "react";

type BubbleTipItem = {
  title: string;
  body: string;
};

type BubbleTipProps = {
  title?: string;
  body?: string;
  tips?: BubbleTipItem[];
  label?: string;
};

const fallbackTips: BubbleTipItem[] = [
  {
    title: "Wonder Tip",
    body: "Use color-coded pouches for homework, crafts, and travel kits to keep kids organized."
  },
  {
    title: "Parent Tip",
    body: "Bundle journals with matching pen sets to make gifting easier and increase repeat purchases."
  },
  {
    title: "Creative Tip",
    body: "Sticker packs work best when grouped by theme so kids can pick quickly without decision fatigue."
  },
  {
    title: "School Tip",
    body: "Prepare weekly refill kits for pencils, erasers, and sharpeners to avoid mid-week supply stress."
  },
  {
    title: "Shop Tip",
    body: "Feature one easy starter bundle on top of each category page for faster conversions."
  }
];

function normalizeTips({
  title,
  body,
  tips
}: {
  title?: string;
  body?: string;
  tips?: BubbleTipItem[];
}): BubbleTipItem[] {
  if (Array.isArray(tips) && tips.length) {
    const filteredTips = tips
      .filter((tip) => Boolean(tip?.title?.trim()) && Boolean(tip?.body?.trim()))
      .slice(0, 10);

    if (filteredTips.length) {
      return filteredTips;
    }
  }

  if (title?.trim() && body?.trim()) {
    return [{ title: title.trim(), body: body.trim() }];
  }

  return fallbackTips;
}

export function BubbleTip({ title, body, tips, label = "lightbulb" }: BubbleTipProps) {
  const normalizedTips = useMemo(() => normalizeTips({ title, body, tips }), [title, body, tips]);
  const [activeIndex, setActiveIndex] = useState(0);

  const tipCount = normalizedTips.length;
  const activeTip = normalizedTips[activeIndex] || fallbackTips[0];
  const canNavigate = tipCount > 1;

  useEffect(() => {
    if (!tipCount) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => current % tipCount);
  }, [tipCount]);

  function nextTip() {
    setActiveIndex((current) => (current + 1) % tipCount);
  }

  function previousTip() {
    setActiveIndex((current) => (current - 1 + tipCount) % tipCount);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-secondary p-8 text-on-secondary shadow-xl shadow-secondary/25 md:p-10">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <span
            className="material-symbols-outlined text-4xl text-tertiary-container"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {label}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-black">{activeTip.title}</h3>
            <p className="mt-2 text-sm text-on-secondary/90 md:text-base">{activeTip.body}</p>
          </div>
        </div>

        {canNavigate ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={previousTip}
              className="rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-on-secondary transition-colors hover:bg-white/20"
              aria-label="Show previous tip"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={nextTip}
              className="rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-on-secondary transition-colors hover:bg-white/20"
              aria-label="Show next tip"
            >
              Next
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-secondary/85">
              Tip {activeIndex + 1} of {tipCount}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

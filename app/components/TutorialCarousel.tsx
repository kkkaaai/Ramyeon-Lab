"use client";

import { useEffect, useState } from "react";

type Tutorial = {
  name: string;
  image: string;
  alt: string;
  altImages?: string[];
  tagline: string;
  steps: string[];
};

export function TutorialCarousel({ tutorials }: { tutorials: Tutorial[] }) {
  const [index, setIndex] = useState(0);
  const t = tutorials[index];
  const prev = () => setIndex((i) => (i - 1 + tutorials.length) % tutorials.length);
  const next = () => setIndex((i) => (i + 1) % tutorials.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when the user is typing into a form field or editable element.
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-3">
      {/* Desktop-only left arrow */}
      <button
        onClick={prev}
        aria-label="Previous tutorial"
        className="hidden md:flex shrink-0 bg-rl-yellow border-[3px] border-rl-border rounded-lg px-3 items-center font-pixel text-[14px] text-rl-text shadow-pixel-sm hover:translate-y-[2px] transition-all"
      >
        ◀
      </button>

      <div className="flex-1 bg-white border-[3px] border-rl-border rounded-lg p-4 md:p-6 font-pixel leading-[1.6]">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
          <div className="shrink-0 flex flex-row md:flex-col gap-2 items-center justify-center">
            {[t.image, ...(t.altImages ?? [])].map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={t.alt}
                className="w-24 h-24 md:w-40 md:h-40 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            ))}
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="font-pixel text-rl-text uppercase text-[15px] md:text-[16px] mb-2 md:mb-3 leading-[1.6] text-center md:text-left">
              {t.name}
            </div>
            <div className="font-sans text-rl-text text-[13px] md:text-[16px] mb-4 md:mb-5 italic font-semibold text-center md:text-left leading-snug">
              {t.tagline}
            </div>
            <ol className="list-decimal list-outside ml-5 space-y-2 md:space-y-3 font-sans text-[15px] md:text-[17px] text-rl-text leading-[1.5] md:leading-[1.55] font-bold">
              {t.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Mobile nav: prev / dots / next all in one row below the content.
            Desktop: only the dots — the side arrows handle navigation. */}
        <div className="flex items-center justify-between md:justify-center gap-3 mt-5 pt-4 border-t-2 border-rl-border/20">
          <button
            onClick={prev}
            aria-label="Previous tutorial"
            className="md:hidden bg-rl-yellow border-[3px] border-rl-border rounded-lg px-4 py-2 font-pixel text-[14px] text-rl-text shadow-pixel-sm active:translate-y-[1px] transition-all"
          >
            ◀
          </button>
          <div className="flex gap-2">
            {tutorials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to tutorial ${i + 1}`}
                className={`w-3 h-3 border-2 border-rl-border ${
                  i === index ? "bg-rl-yellow" : "bg-white"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            aria-label="Next tutorial"
            className="md:hidden bg-rl-yellow border-[3px] border-rl-border rounded-lg px-4 py-2 font-pixel text-[14px] text-rl-text shadow-pixel-sm active:translate-y-[1px] transition-all"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Desktop-only right arrow */}
      <button
        onClick={next}
        aria-label="Next tutorial"
        className="hidden md:flex shrink-0 bg-rl-yellow border-[3px] border-rl-border rounded-lg px-3 items-center font-pixel text-[14px] text-rl-text shadow-pixel-sm hover:translate-y-[2px] transition-all"
      >
        ▶
      </button>
    </div>
  );
}

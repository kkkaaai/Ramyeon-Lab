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
    <div className="flex items-stretch gap-3">
      <button
        onClick={prev}
        aria-label="Previous tutorial"
        className="shrink-0 bg-rl-yellow border-[3px] border-rl-border rounded-lg px-3 font-pixel text-[14px] text-rl-text shadow-pixel-sm hover:translate-y-[2px] transition-all"
      >
        ◀
      </button>

      <div className="flex-1 bg-white border-[3px] border-rl-border rounded-lg p-6 font-pixel leading-[1.6]">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="shrink-0 flex flex-col gap-2 items-center">
            {[t.image, ...(t.altImages ?? [])].map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={t.alt}
                className="w-40 h-40 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            ))}
            <div className="font-sans text-rl-muted text-[11px] italic text-center">examples</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-rl-text uppercase text-[16px] mb-3 leading-[1.8]">{t.name}</div>
            <div className="font-sans text-rl-text text-[16px] mb-5 italic font-semibold">{t.tagline}</div>
            <ol className="list-decimal list-outside ml-5 space-y-3 font-sans text-[17px] text-rl-text leading-[1.55] font-bold">
              {t.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-5">
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
      </div>

      <button
        onClick={next}
        aria-label="Next tutorial"
        className="shrink-0 bg-rl-yellow border-[3px] border-rl-border rounded-lg px-3 font-pixel text-[14px] text-rl-text shadow-pixel-sm hover:translate-y-[2px] transition-all"
      >
        ▶
      </button>
    </div>
  );
}

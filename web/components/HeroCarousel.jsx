"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";
import { getCmsSettings } from "@/lib/api";

export default function HeroCarousel({ initialSlides = [] }) {
  const [slides, setSlides] = useState(initialSlides);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) return;
    async function loadCmsSlides() {
      const res = await getCmsSettings();
      if (res?.success && Array.isArray(res.settings?.hero_slides)) {
        setSlides(res.settings.hero_slides);
      }
    }
    loadCmsSlides();
  }, [initialSlides]);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  if (slides.length === 0) return null;

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
  };

  return (
    <section
      aria-label="Promotional Banners"
      className="relative w-full overflow-hidden bg-neutral-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full aspect-[2/1] sm:aspect-[2.6/1] md:aspect-[3/1] lg:aspect-[3.5/1] xl:aspect-[3.5/1] min-h-[170px] sm:min-h-[220px] max-h-[440px] flex items-center">
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          const hasTitle = Boolean(slide.title && slide.title.trim());
          const hasSubtitle = Boolean(
            (slide.subtitle && slide.subtitle.trim()) ||
            (slide.description && slide.description.trim())
          );
          const hasOffer = Boolean(slide.offer && slide.offer.trim());
          const hasTextContent = hasTitle || hasSubtitle || hasOffer;

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background / Banner Image with Tap-to-link */}
              <Link
                href={slide.link || "/shop"}
                className="absolute inset-0 w-full h-full block"
                title={slide.title || "Shop Collection"}
              >
                <Image
                  src={slide.image || slide.banner_url || "/logo.png"}
                  alt={slide.title || "Agal Boutique Banner"}
                  fill
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  loading={idx === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="object-cover object-center w-full h-full"
                />

                {/* Dark gradient overlay ONLY if text is present to preserve full clean image when no text */}
                {hasTextContent && (
                  <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20 sm:to-transparent" />
                )}
              </Link>

              {/* Animated Banner Content (Rendered ONLY when slide has title, subtitle, or offer) */}
              {hasTextContent && (
                <div className="flex relative z-10 max-w-[var(--container)] h-full mx-auto px-4 sm:px-8 lg:px-12 flex-col justify-center py-4 sm:py-6 text-white pointer-events-none">
                  <div
                    className={`max-w-xl sm:max-w-2xl space-y-2 sm:space-y-3 pointer-events-auto transition-all duration-700 delay-150 ease-out transform ${
                      isActive ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95"
                    }`}
                  >
                    {/* Title */}
                    {hasTitle && (
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white !text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                        {slide.title}
                      </h2>
                    )}

                    {/* Subtitle / Description */}
                    {hasSubtitle && (
                      <p className="text-xs sm:text-sm md:text-base text-gray-100 font-medium drop-shadow-md line-clamp-2">
                        {slide.subtitle || slide.description}
                      </p>
                    )}

                    {/* Offer badge */}
                    {hasOffer && (
                      <div className="inline-block px-2.5 py-0.5 bg-amber-400 text-black text-[10px] sm:text-xs font-black rounded shadow-xs">
                        {slide.offer}
                      </div>
                    )}

                    {/* CTA button */}
                    <div className="pt-0.5 sm:pt-1">
                      <Link
                        href={slide.link || "/shop"}
                        className="inline-flex items-center justify-center h-8 sm:h-9 md:h-10 px-4 sm:px-6 rounded-[5px] bg-white text-plum-900 font-black text-xs sm:text-sm shadow-lg hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
                      >
                        {slide.cta || "Shop Collection"} →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  current === idx ? "w-7 bg-white shadow-xs" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

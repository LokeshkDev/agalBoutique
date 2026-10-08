"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";
import { getCmsSettings } from "@/lib/api";

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    async function loadCmsSlides() {
      const res = await getCmsSettings();
      if (res?.success && res.settings?.hero_slides && Array.isArray(res.settings.hero_slides)) {
        setSlides(res.settings.hero_slides);
      }
    }
    loadCmsSlides();
  }, []);

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
      className="relative w-full overflow-hidden bg-gray-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full min-h-[240px] sm:min-h-[320px] lg:min-h-[380px] flex items-center">
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image with Tap-to-link on mobile */}
              <Link href={slide.link || "/shop"} className="absolute inset-0 w-full h-full block">
                <Image
                  src={slide.image || slide.banner_url || "/logo.png"}
                  alt={slide.title || "Agal Boutique"}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
                {/* Clean dark gradient overlay for text readability */}
                <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30 sm:to-transparent" />
              </Link>

              {/* Banner Content (Visible on sm: screens and above) */}
              <div className="hidden sm:flex relative z-10 max-w-[var(--container)] h-full mx-auto px-4 sm:px-8 lg:px-12 flex-col justify-center py-6 sm:py-10 text-white pointer-events-none">
                <div className="max-w-xl space-y-2 sm:space-y-3.5 pointer-events-auto">
                  {/* Badge */}
                  {slide.badge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[11px] font-extrabold uppercase tracking-wider shadow-sm bg-white text-plum">
                      <Sparkle size={12} weight="fill" /> {slide.badge}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm lg:text-base text-gray-100 font-medium line-clamp-2 sm:line-clamp-none drop-shadow-sm">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Offer highlight */}
                  {slide.offer && (
                    <div className="pt-0.5">
                      <span className="inline-block px-3 py-1 rounded-[4px] bg-white/20 backdrop-blur-xs text-xs sm:text-sm font-bold text-white border border-white/40 shadow-xs">
                        {slide.offer}
                      </span>
                    </div>
                  )}

                  {/* CTA button */}
                  <div className="pt-2">
                    <Link
                      href={slide.link || "/shop"}
                      className="inline-flex items-center justify-center h-10 sm:h-12 px-6 sm:px-8 rounded-[5px] bg-white text-gray-950 font-extrabold text-xs sm:text-sm shadow-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                    >
                      {slide.cta || "Shop Now"} →
                    </Link>
                  </div>
                </div>
              </div>
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

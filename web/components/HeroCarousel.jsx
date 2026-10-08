"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";
import { getCmsSettings } from "@/lib/api";

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: "Grand Festive Handloom Mela",
    subtitle: "Pure Kanchipuram Silks, Cambric Cotton Kurtis & Suits",
    offer: "Flat 15% OFF with Code FESTIVE15 · Free Delivery Across India",
    link: "/shop?category=sarees",
    cta: "Shop Festive Edit",
    badge: "Festive Exclusive",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
  },
  {
    id: 2,
    title: "3–5 Days Custom Blouse Stitching",
    subtitle: "Send measurements on WhatsApp or pick standard sizes",
    offer: "Master Craftsmanship from Tamil Nadu · Free Alteration Guarantee",
    link: "/shop?category=blouses",
    cta: "Explore Blouse Styles",
    badge: "Bespoke Tailoring",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
  },
  {
    id: 3,
    title: "Pure Cotton Kurtis & Full Sets",
    subtitle: "Breathable cambric cottons, straight cuts & festive Anarkalis",
    offer: "Daily Wear & Office Styles starting from ₹699",
    link: "/shop?category=kurtis",
    cta: "Shop Kurtis & Sets",
    badge: "Trending Daily Wear",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
  },
  {
    id: 4,
    title: "Girls Pattu Pavadai & Kidswear",
    subtitle: "Traditional South Indian jacquard silk sets with soft cotton lining",
    offer: "Ages 2 to 12 Years · Starting from ₹699",
    link: "/shop?category=kidswear",
    cta: "View Kids Collection",
    badge: "Kids Special",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1200&q=80",
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    async function loadCmsSlides() {
      const res = await getCmsSettings();
      if (res?.success && res.settings?.hero_slides && Array.isArray(res.settings.hero_slides) && res.settings.hero_slides.length > 0) {
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

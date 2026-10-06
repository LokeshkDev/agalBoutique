"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkle } from "@phosphor-icons/react";

const SLIDES = [
  {
    id: 1,
    title: "Grand Festive Handloom Mela",
    subtitle: "Pure Kanchipuram Silks, Cambric Cotton Kurtis & Suits",
    offer: "Flat 15% OFF with Code FESTIVE15 · Free Delivery Across India",
    link: "/shop?category=sarees",
    cta: "Shop Festive Edit",
    badgeBg: "bg-white text-plum",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
    badge: "Festive Exclusive",
  },
  {
    id: 2,
    title: "3–5 Days Custom Blouse Stitching",
    subtitle: "Send measurements on WhatsApp or pick standard sizes",
    offer: "Master Craftsmanship from Tamil Nadu · Free Alteration Guarantee",
    link: "/shop?category=blouses",
    cta: "Explore Blouse Styles",
    badgeBg: "bg-white text-crimson-700",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
    badge: "Bespoke Tailoring",
  },
  {
    id: 3,
    title: "Pure Cotton Kurtis & Full Sets",
    subtitle: "Breathable cambric cottons, straight cuts & festive Anarkalis",
    offer: "Daily Wear & Office Styles starting from ₹699",
    link: "/shop?category=kurtis",
    cta: "Shop Kurtis & Sets",
    badgeBg: "bg-white text-[#1d3557]",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
    badge: "Trending Daily Wear",
  },
  {
    id: 4,
    title: "Girls Pattu Pavadai & Kidswear",
    subtitle: "Traditional South Indian jacquard silk sets with soft cotton lining",
    offer: "Ages 2 to 12 Years · Starting from ₹699",
    link: "/shop?category=kidswear",
    cta: "View Kids Collection",
    badgeBg: "bg-white text-purple-900",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1200&q=80",
    badge: "Kids Special",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
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
        {SLIDES.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image with High-Contrast Gradient Backdrop */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
                {/* Clean dark gradient overlay for 100% crisp text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30 sm:to-transparent" />
              </div>

              {/* Banner Content */}
              <div className="relative z-10 max-w-[var(--container)] h-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-center py-6 sm:py-10 text-white">
                <div className="max-w-xl space-y-2 sm:space-y-3.5">
                  {/* Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${slide.badgeBg}`}
                  >
                    <Sparkle size={12} weight="fill" /> {slide.badge}
                  </span>

                  {/* Title */}
                  <h2
                    style={{ color: "#ffffff" }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                  >
                    {slide.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm lg:text-base text-gray-100 font-medium line-clamp-2 sm:line-clamp-none drop-shadow-sm">
                    {slide.subtitle}
                  </p>

                  {/* Offer highlight */}
                  <div className="pt-0.5">
                    <span className="inline-block px-3 py-1 rounded-[4px] bg-white/20 backdrop-blur-xs text-xs sm:text-sm font-bold text-white border border-white/40 shadow-xs">
                      {slide.offer}
                    </span>
                  </div>

                  {/* CTA button */}
                  <div className="pt-2">
                    <Link
                      href={slide.link}
                      className="inline-flex items-center justify-center h-10 sm:h-12 px-6 sm:px-8 rounded-[5px] bg-white text-gray-950 font-extrabold text-xs sm:text-sm shadow-md hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                    >
                      {slide.cta} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-2">
          {SLIDES.map((_, idx) => (
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
      </div>
    </section>
  );
}


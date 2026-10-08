"use client";

import { useState, useEffect } from "react";
import { Star, CaretLeft, CaretRight, CheckCircle } from "@phosphor-icons/react";
import { getCmsSettings } from "@/lib/api";

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "Priya Sundaram",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    tag: "Custom Blouse Stitching",
    date: "Verified Buyer",
    review:
      "Ordered custom blouse stitching for my Kanchipuram silk saree. The fit was 100% accurate to the measurements I sent on WhatsApp! The neck piping and dori work were so neat. Highly recommend Agal Boutique.",
  },
  {
    id: 2,
    name: "Kavitha Rangarajan",
    location: "Coimbatore, Tamil Nadu",
    rating: 5,
    tag: "Pure Cotton Kurti Set",
    date: "Verified Buyer",
    review:
      "The cambric cotton fabric is exceptionally soft and breathable for daily office wear. The colors didn't bleed even after multiple washes. Delivery reached Coimbatore in just 2 days.",
  },
  {
    id: 3,
    name: "Ananya Deshmukh",
    location: "Bengaluru, Karnataka",
    rating: 5,
    tag: "Festive Silk Anarkali",
    date: "Verified Buyer",
    review:
      "Received so many compliments at my cousin's sangeet! The zari border on the dupatta looks rich and royal. The dress arrived neatly packed with zero wrinkles.",
  },
  {
    id: 4,
    name: "Meenakshi Natarajan",
    location: "Madurai, Tamil Nadu",
    rating: 5,
    tag: "Girls Pattu Pavadai",
    date: "Verified Buyer",
    review:
      "Bought the yellow & magenta pattu pavadai for my 5-year-old daughter's birthday. The pure cotton inner lining ensured she was comfortable all day without any itching. Beautiful traditional weave.",
  },
  {
    id: 5,
    name: "Deepa Krishnan",
    location: "Hyderabad, Telangana",
    rating: 5,
    tag: "Handloom Saree & Blouse",
    date: "Verified Buyer",
    review:
      "The drape of the Chettinad cotton saree is so effortless. Fast dispatch and prompt updates on WhatsApp from the team. Will definitely be ordering my festive wardrobe from here again!",
  },
];

export default function TestimonialsSlider() {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function loadTestimonials() {
      const res = await getCmsSettings();
      if (res?.success && res.settings?.testimonials && Array.isArray(res.settings.testimonials) && res.settings.testimonials.length > 0) {
        setTestimonials(res.settings.testimonials);
      }
    }
    loadTestimonials();
  }, []);

  // Auto-scroll on slider
  useEffect(() => {
    if (isPaused || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  if (testimonials.length === 0) return null;

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-12 lg:py-16 bg-[#faf5f8] border-t border-line overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#e6f4ea] text-[#238b45] text-xs font-bold uppercase tracking-wider mb-2">
              <Star size={14} weight="fill" /> 4.8 / 5 Customer Satisfaction
            </div>
            <h2
              id="testimonials-heading"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            >
              What Our Customers Say
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Verified reviews from women who love our fabrics & custom stitching
            </p>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-[5px] bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-700 hover:text-plum hover:border-plum transition-colors cursor-pointer"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-[5px] bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-700 hover:text-plum hover:border-plum transition-colors cursor-pointer"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[0, 1, 2].map((offset) => {
              const item = testimonials[(currentIdx + offset) % testimonials.length];
              if (!item) return null;

              const isHiddenOnMobile = offset > 0 ? "hidden md:block" : "";
              const isHiddenOnTablet = offset > 1 ? "hidden lg:block" : "";

              return (
                <div
                  key={item.id + "-" + offset}
                  className={`bg-white rounded-[5px] p-5 sm:p-6 shadow-card border border-gray-100 flex flex-col justify-between transition-all duration-300 ${isHiddenOnMobile} ${isHiddenOnTablet}`}
                >
                  <div className="space-y-3">
                    {/* Stars + Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex text-[#238b45] gap-0.5">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} size={16} weight="fill" />
                        ))}
                      </div>
                      {item.tag && (
                        <span className="text-[11px] font-bold text-plum bg-plum-50 px-2 py-0.5 rounded-[4px]">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
                      "{item.review}"
                    </p>
                  </div>

                  {/* Author footer */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-500">{item.location}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#238b45]">
                      <CheckCircle size={14} weight="fill" />
                      {item.date || "Verified Buyer"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    currentIdx === idx ? "w-6 bg-plum" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

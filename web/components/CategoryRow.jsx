"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { getCategories, getResolvedImageUrl } from "@/lib/api";

export default function CategoryRow({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;
    async function loadData() {
      const res = await getCategories();
      if (res?.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
      }
    }
    loadData();
  }, [initialCategories]);

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
  }, [categories]);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  if (categories.length === 0) return null;

  const isCarousel = categories.length > 5;

  // Compute desktop grid columns when in row-filling grid mode (<= 5 items)
  const getGridColsClass = () => {
    if (categories.length === 1) return "lg:grid-cols-1 max-w-xs mx-auto";
    if (categories.length === 2) return "lg:grid-cols-2 max-w-xl mx-auto";
    if (categories.length === 3) return "lg:grid-cols-3 max-w-3xl mx-auto";
    if (categories.length === 4) return "lg:grid-cols-4";
    return "lg:grid-cols-5"; // Exactly 5 categories fills the full width evenly
  };

  return (
    <section
      aria-labelledby="categories-heading"
      className="py-[16px] sm:py-[18px] bg-white animate-section-reveal"
    >
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2
              id="categories-heading"
              className="text-xl sm:text-2xl font-extrabold text-gray-900"
            >
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Explore curated boutique collections & handpicked styles
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Carousel navigation arrow buttons if exceed 5 */}
            {isCarousel && (
              <div className="flex items-center gap-1.5 mr-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous categories"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-plum hover:border-plum disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs active:scale-95"
                  title="Scroll left"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  disabled={!canScrollRight}
                  aria-label="Next categories"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:text-plum hover:border-plum disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs active:scale-95"
                  title="Scroll right"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
            )}

            <Link
              href="/shop"
              className="text-xs sm:text-sm font-bold text-plum hover:underline shrink-0"
            >
              View All →
            </Link>
          </div>
        </div>

        {/* Categories Display */}
        {isCarousel ? (
          /* Carousel layout when categories exceed 5 */
          <div
            ref={carouselRef}
            onScroll={checkScroll}
            className="flex items-start gap-3 sm:gap-4 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 -my-2 px-1 -mx-1"
          >
            {categories.map((cat) => {
              const imgUrl = getResolvedImageUrl(cat.image);

              return (
                <div
                  key={cat.slug}
                  className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc((100%-4*1.5rem)/5)] shrink-0 snap-start"
                >
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="w-full group text-center flex flex-col items-center cursor-pointer"
                  >
                    {/* Arched Pastel Dome Frame */}
                    <div className="relative w-full aspect-[165/209] rounded-t-[999px] rounded-b-none bg-[#faeef4] overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md border border-pink-100/60">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={cat.name}
                          fill
                          loading="lazy"
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 220px"
                          className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-plum text-base p-2 text-center">
                          {cat.name}
                        </div>
                      )}
                    </div>

                    {/* Category Label */}
                    <span className="mt-2.5 text-xs sm:text-[13px] lg:text-sm font-bold text-gray-900 group-hover:text-plum transition-colors text-center leading-tight sm:leading-snug break-words px-1 w-full block">
                      {cat.name}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          /* Static Row Grid when <= 5 items (perfectly fills row on desktop) */
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 ${getGridColsClass()} gap-3 sm:gap-4 lg:gap-6 items-start`}
          >
            {categories.map((cat) => {
              const imgUrl = getResolvedImageUrl(cat.image);

              return (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="w-full group text-center flex flex-col items-center cursor-pointer"
                >
                  {/* Arched Pastel Dome Frame */}
                  <div className="relative w-full aspect-[165/209] rounded-t-[999px] rounded-b-none bg-[#faeef4] overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md border border-pink-100/60">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={cat.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 220px"
                        className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-plum text-base p-2 text-center">
                        {cat.name}
                      </div>
                    )}
                  </div>

                  {/* Category Label */}
                  <span className="mt-2.5 text-xs sm:text-[13px] lg:text-sm font-bold text-gray-900 group-hover:text-plum transition-colors text-center leading-tight sm:leading-snug break-words px-1 w-full block">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/api";

export default function CategoryRow() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadData() {
      const res = await getCategories();
      if (res?.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
      }
    }
    loadData();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-heading" className="py-6 lg:py-10 bg-white animate-section-reveal">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-baseline justify-between mb-6">
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

          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-plum hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* Categories 2-Column Grid on Mobile/Tab & 6-Column Grid on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 items-start">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="w-full group text-center flex flex-col items-center cursor-pointer"
            >
              {/* Arched Pastel Dome Frame */}
              <div className="relative w-full aspect-[4/5] rounded-t-[999px] rounded-b-[16px] bg-[#f7eaf2] overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md border border-pink-100/50">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 160px"
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-plum text-lg">
                    {cat.name}
                  </div>
                )}
              </div>

              {/* Clean Centered Category Label */}
              <span className="mt-2.5 text-xs sm:text-sm lg:text-base font-bold text-gray-900 group-hover:text-plum transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

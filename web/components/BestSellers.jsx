"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { Tag } from "@phosphor-icons/react";

export default function BestSellers() {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    async function loadData() {
      const res = await getProducts({ sort: "rating", limit: 8 });
      if (res?.success && Array.isArray(res.products)) {
        setBestSellers(res.products);
      }
    }
    loadData();
  }, []);

  if (bestSellers.length === 0) return null;

  return (
    <section aria-labelledby="bestsellers-heading" className="py-8 lg:py-14 bg-white animate-section-reveal">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Festive Coupon Strip */}
        <div className="mb-6 p-3 sm:p-4 rounded-[5px] bg-[#fff0f4] border border-[#ffccd8] flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Tag size={18} weight="fill" className="text-crimson shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-crimson-700">
              Special Festive Offer: Flat 15% OFF on orders above ₹1,999
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Use Code:</span>
            <span className="px-2.5 py-1 rounded-[4px] bg-white border border-crimson/30 text-xs font-mono font-extrabold text-crimson">
              FESTIVE15
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2
              id="bestsellers-heading"
              className="text-xl sm:text-2xl font-bold text-gray-900"
            >
              Most Loved Bestsellers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-sans">
              Top-rated styles loved by happy shoppers
            </p>
          </div>
          <Link
            href="/shop?sort=rating"
            className="text-xs sm:text-sm font-bold text-plum hover:underline"
          >
            Explore all →
          </Link>
        </div>

        {/* Product Cards Row */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[180px] sm:w-[220px] lg:w-auto snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

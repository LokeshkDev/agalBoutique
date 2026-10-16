"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export default function BestSellers({ initialProducts = [] }) {
  const [bestSellers, setBestSellers] = useState(initialProducts);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) return;
    async function loadData() {
      // Prioritize products marked as Most Loved Bestsellers (isBestseller = true)
      const res = await getProducts({ isBestseller: true, limit: 12 });
      if (res?.success && Array.isArray(res.products) && res.products.length > 0) {
        setBestSellers(res.products);
      } else {
        const fallbackRes = await getProducts({ sort: "rating", limit: 8 });
        if (fallbackRes?.success && Array.isArray(fallbackRes.products)) {
          setBestSellers(fallbackRes.products);
        }
      }
    }
    loadData();
  }, [initialProducts]);

  if (bestSellers.length === 0) return null;

  return (
    <section aria-labelledby="bestsellers-heading" className="py-[16px] sm:py-[18px] bg-white animate-section-reveal">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Section Heading */}
        <div className="flex items-baseline justify-between mb-3">
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
            href="/shop?isBestseller=true"
            className="text-xs sm:text-sm font-bold text-plum hover:underline"
          >
            Explore all ({bestSellers.length}) →
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

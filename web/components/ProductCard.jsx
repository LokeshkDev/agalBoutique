"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Eye } from "@phosphor-icons/react";
import { formatPrice, discountPercent, getColorHex } from "@/lib/format";
import QuickViewModal from "@/components/QuickViewModal";

/**
 * Meesho / Myntra style Product Card:
 * - 5px rounded corners on image, NO borders.
 * - Bold, readable typography.
 * - Top-right Wishlist heart + Quick View eye icon popup.
 * - Green rating badge, color dots on image, large bold price row, discount %, and Free Delivery tag.
 */
export default function ProductCard({ product, priority = false }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const {
    slug,
    name,
    price,
    mrp,
    images,
    rating,
    isNew,
    colors = [],
  } = product;

  const mainImage = images?.[0]?.url || "/logo.png";
  const discount = discountPercent(price, mrp);

  return (
    <>
      <article className="group relative flex flex-col bg-white rounded-[5px] transition-shadow duration-200 hover:shadow-card p-1 sm:p-2">
        {/* Clickable Image Container */}
        <div className="relative aspect-[3/4] w-full rounded-[5px] overflow-hidden bg-gray-50">
          <Link href={`/product/${slug}`} className="block w-full h-full">
            <Image
              src={mainImage}
              alt={images?.[0]?.alt || name}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1359px) 25vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
            />
          </Link>

          {/* Top-Left Tag: Meesho / Myntra Style */}
          {isNew ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[3px] bg-[#9c27b0] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs">
              Trending
            </span>
          ) : discount >= 40 ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[3px] bg-[#e3174b] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs">
              Special Price
            </span>
          ) : null}

          {/* Action Buttons Top-Right (Wishlist + Quick View) */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            {/* Wishlist Heart */}
            <button
              type="button"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWishlisted(!wishlisted);
              }}
              className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-700 hover:text-crimson active:scale-90 transition-transform cursor-pointer"
            >
              <Heart
                size={18}
                weight={wishlisted ? "fill" : "regular"}
                className={wishlisted ? "text-crimson" : "text-gray-700"}
              />
            </button>

            {/* Quick View Eye Icon */}
            <button
              type="button"
              aria-label="Quick View"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-700 hover:text-plum active:scale-90 transition-transform cursor-pointer"
              title="Quick View"
            >
              <Eye size={18} weight="bold" />
            </button>
          </div>

          {/* Floating Rating Pill on Image (Bottom-Left) */}
          {rating?.count > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-white/95 backdrop-blur-xs text-gray-800 text-[11px] font-bold shadow-xs">
              <span className="text-[#238b45] font-extrabold">{rating.avg}</span>
              <Star size={10} weight="fill" className="text-[#238b45]" />
              <span className="text-gray-400 font-normal">| {rating.count}</span>
            </div>
          )}

          {/* Floating Color Options Badge on Image (Bottom-Right) */}
          {colors.length > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-white/95 backdrop-blur-xs text-gray-800 text-[10px] font-bold shadow-xs">
              <div className="flex -space-x-1 items-center">
                {colors.slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-white shadow-xs inline-block"
                    style={{ backgroundColor: getColorHex(c) }}
                    title={c}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-gray-700">
                {colors.length} {colors.length === 1 ? "Color" : "Colors"}
              </span>
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="pt-2 pb-1 px-0.5 space-y-1">
          {/* Title - Readable, crisp font */}
          <Link href={`/product/${slug}`} className="block">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 hover:text-plum transition-colors leading-snug">
              {name}
            </h3>
          </Link>

          {/* Pricing Row - Bold & Clear */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-lg sm:text-xl font-extrabold text-gray-900 font-sans">
              {formatPrice(price)}
            </span>
            {mrp && mrp > price && (
              <>
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  {formatPrice(mrp)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#038a41]">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          {/* Micro Delivery Tag */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="inline-block text-xs font-bold text-[#038a41] bg-[#e6f4ea] px-2 py-0.5 rounded-[3px]">
              Free Delivery
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {product.fabric}
            </span>
          </div>
        </div>
      </article>

      {/* Quick View Mobile/Desktop Popup */}
      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}

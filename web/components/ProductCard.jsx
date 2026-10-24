"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Handbag, Plus, Minus } from "@phosphor-icons/react";
import { formatPrice, discountPercent } from "@/lib/format";
import { normalizeImageUrl } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useShallow } from "zustand/react/shallow";

/**
 * Compact Product Card:
 * - Reduced height with aspect-[4/5] image container.
 * - Clean display with no circular overlay icons/ellipses cutting off text.
 * - Direct Add to Cart button that turns into [- count +] once added.
 */
function ProductCard({ product, priority = false }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { items = [], add: addItem, setQty, remove: removeItem } = useCart(
    useShallow((s) => ({
      items: s.items || [],
      add: s.add,
      setQty: s.setQty,
      remove: s.remove,
    }))
  );

  const {
    slug,
    name,
    price,
    mrp,
    images,
    isNew,
  } = product;

  const mainImage = normalizeImageUrl(images?.[0]);
  const [imgSrc, setImgSrc] = useState(mainImage);

  useEffect(() => {
    setImgSrc(normalizeImageUrl(images?.[0]));
  }, [images]);

  const discount = discountPercent(price, mrp);

  // Match items in cart for this product
  const matchingCartItems = items.filter(
    (item) => String(item.id) === String(product.id)
  );
  const inCartQty = matchingCartItems.reduce(
    (acc, item) => acc + (item.qty || item.quantity || 1),
    0
  );

  const defaultSize =
    product?.sizes?.find((s) => (typeof s === "object" ? parseInt(s.stock, 10) > 0 : true))?.label ||
    (typeof product?.sizes?.[0] === "object" ? product?.sizes?.[0]?.label : product?.sizes?.[0]) ||
    "Free Size";
  const defaultColor = product?.colors?.[0] || "";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        mrp: product.mrp,
        size: defaultSize,
        color: defaultColor,
        qty: 1,
        image: imgSrc || normalizeImageUrl(images?.[0]) || "/logo.png",
        images: product.images,
      },
      false
    );
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (matchingCartItems.length > 0) {
      const lastItem = matchingCartItems[matchingCartItems.length - 1];
      setQty(lastItem.id, lastItem.size, (lastItem.qty || 1) + 1, lastItem.color);
    } else {
      handleAddToCart(e);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (matchingCartItems.length === 0) return;
    const lastItem = matchingCartItems[matchingCartItems.length - 1];
    if ((lastItem.qty || 1) <= 1) {
      removeItem(lastItem.id, lastItem.size, lastItem.color);
    } else {
      setQty(lastItem.id, lastItem.size, (lastItem.qty || 1) - 1, lastItem.color);
    }
  };

  return (
    <article className="product-card-optimize group relative flex flex-col justify-between bg-white rounded-[5px] transition-shadow duration-200 hover:shadow-card p-1 sm:p-1.5 border border-gray-100">
      {/* Clickable Image Container (Reduced Height) */}
      <div>
        <div className="relative aspect-[4/5] w-full rounded-[4px] overflow-hidden bg-gray-50">
          <Link href={`/product/${slug}`} className="relative block w-full h-full">
            <Image
              src={imgSrc || "/logo.png"}
              alt={images?.[0]?.alt || name}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1359px) 25vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
              loading={priority ? "eager" : "lazy"}
              onError={() => setImgSrc("/logo.png")}
            />
          </Link>

          {/* Top-Left Tag: Clean and Crisp */}
          {isNew ? (
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[3px] bg-[#9c27b0] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Trending
            </span>
          ) : discount >= 40 ? (
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-[3px] bg-[#e3174b] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Special Price
            </span>
          ) : null}
        </div>

        {/* Product Details Section */}
        <div className="pt-1.5 pb-1 px-0.5 space-y-1">
          {/* Title - Clean text without cutting off awkwardly */}
          <Link href={`/product/${slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 hover:text-plum transition-colors leading-tight min-h-[2rem]">
              {name}
            </h3>
          </Link>

          {/* Pricing Row - Bold & Clear */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-gray-900 font-sans">
              {formatPrice(price)}
            </span>
            {mrp && mrp > price && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(mrp)}
                </span>
                <span className="text-xs font-bold text-[#038a41]">
                  {discount}% off
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart / [- count +] Action Row */}
      <div className="pt-1 px-0.5">
        {mounted && inCartQty > 0 ? (
          <div
            className="w-full h-8 flex items-center justify-between rounded-[4px] bg-plum text-white font-bold text-xs shadow-xs px-1 select-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={handleDecrement}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 active:scale-90 transition-transform cursor-pointer text-white"
            >
              <Minus size={13} weight="bold" />
            </button>
            <span className="font-extrabold text-xs sm:text-sm font-sans px-2">
              {inCartQty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={handleIncrement}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 active:scale-90 transition-transform cursor-pointer text-white"
            >
              <Plus size={13} weight="bold" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={`Add ${name} to cart`}
            onClick={handleAddToCart}
            className="w-full h-8 flex items-center justify-center gap-1.5 rounded-[4px] border border-plum text-plum hover:bg-plum hover:text-white active:scale-98 font-bold text-xs transition-colors shadow-2xs cursor-pointer select-none"
          >
            <Handbag size={14} weight="bold" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default memo(ProductCard);

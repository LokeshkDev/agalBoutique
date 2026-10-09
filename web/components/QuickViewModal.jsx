"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, Handbag, Check, ArrowRight } from "@phosphor-icons/react";
import { formatPrice, discountPercent, getColorHex } from "@/lib/format";
import { useCart } from "@/store/cart";
import { normalizeImageUrl } from "@/lib/api";

export default function QuickViewModal({ product, open, onClose }) {
  const defaultSize =
    product?.sizes?.find((s) => (typeof s === "object" ? parseInt(s.stock, 10) > 0 : true))?.label ||
    (typeof product?.sizes?.[0] === "object" ? product?.sizes?.[0]?.label : product?.sizes?.[0]) ||
    "Free Size";

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || ""
  );
  const [qty, setQty] = useState(1);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (open && product) {
      const initSize =
        product?.sizes?.find((s) => (typeof s === "object" ? parseInt(s.stock, 10) > 0 : true))?.label ||
        (typeof product?.sizes?.[0] === "object" ? product?.sizes?.[0]?.label : product?.sizes?.[0]) ||
        "Free Size";
      setSelectedSize(initSize);
      setSelectedColor(product?.colors?.[0] || "");
      setSelectedImgIdx(0);
      setQty(1);
      setSizeError(false);
      setAddedSuccess(false);
    }
  }, [open, product]);

  const addItem = useCart((s) => s.add);

  if (!open || !product) return null;

  const discount = discountPercent(product.price, product.mrp);
  const currentImg = normalizeImageUrl(product.images?.[selectedImgIdx] || product.images?.[0]);

  // Stock calculation for selected size & color
  const selectedVariant = product?.sizes?.find(
    (v) =>
      typeof v === "object" &&
      String(v.label) === String(selectedSize) &&
      (!v.color || !selectedColor || String(v.color).toLowerCase() === String(selectedColor).toLowerCase())
  ) || product?.sizes?.find((v) => typeof v === "object" && String(v.label) === String(selectedSize));

  const currentStock = selectedVariant && selectedVariant.stock !== undefined
    ? parseInt(selectedVariant.stock, 10)
    : (product?.sizes?.reduce((sum, s) => sum + (typeof s === "object" ? (parseInt(s.stock, 10) || 0) : 10), 0) ?? 10);

  const isOutOfStock = currentStock <= 0;

  const decrementQty = () => setQty((prev) => Math.max(1, prev - 1));
  const incrementQty = () => setQty((prev) => Math.min(10, prev + 1));

  const handleAddToCart = () => {
    const finalSize =
      selectedSize ||
      product?.sizes?.find((s) => (typeof s === "object" ? parseInt(s.stock, 10) > 0 : true))?.label ||
      "Free Size";

    setSizeError(false);

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      mrp: product.mrp,
      size: finalSize,
      color: selectedColor || product.colors?.[0] || "",
      qty: qty,
      image: normalizeImageUrl(product.images?.[0]),
      images: product.images,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm transition-opacity duration-200 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-3xl md:max-w-4xl bg-white rounded-t-[28px] sm:rounded-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-200 animate-slideUp sm:animate-scaleUp relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header Bar & Drag Handle */}
        <div className="sm:hidden flex items-center justify-between px-4 pt-3 pb-2 bg-white border-b border-gray-100 shrink-0 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-plum animate-pulse" />
            <span className="text-xs font-black text-plum uppercase tracking-wider">Quick Product View</span>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Desktop Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="hidden sm:flex absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/90 shadow-md items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Scrollable Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Main Image & Gallery Strip */}
            <div className="md:col-span-5 lg:col-span-5 space-y-3">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-xs">
                <Image
                  src={currentImg}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, 420px"
                  className="object-cover"
                />
              </div>

              {/* Thumbnails Strip */}
              {product.images?.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {product.images.map((img, idx) => {
                    const thumbUrl = normalizeImageUrl(img);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImgIdx(idx)}
                        className={`relative w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer border ${
                          selectedImgIdx === idx
                            ? "border-plum ring-2 ring-plum/40 shadow-xs"
                            : "border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={thumbUrl}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Product Info, Swatches, Sizes & CTAs */}
            <div className="md:col-span-7 lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black text-plum bg-plum/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <Star size={13} weight="fill" className="text-amber-500" /> {product.rating?.avg || "4.6"} ({product.rating?.count || "94"} Reviews)
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Price & Savings Container */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-gray-50/80 border border-gray-200 space-y-1.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 font-sans">
                    {formatPrice(product.price)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <>
                      <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                        {formatPrice(product.mrp)}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        SAVE {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  ✓ Free Express Delivery Across India · Cash on Delivery Available
                </p>
              </div>

              {/* Fabric & Material Note */}
              {(product.fabric || product.description) && (
                <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                  {product.fabric && (
                    <p><strong className="text-gray-900 font-bold">Fabric & Material:</strong> {product.fabric}</p>
                  )}
                  {product.description && (
                    <p className="line-clamp-2 leading-relaxed text-gray-500">{product.description}</p>
                  )}
                </div>
              )}

              {/* Color Swatches */}
              {product.colors?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-900">
                      Color Option: <span className="text-plum font-extrabold">{selectedColor || product.colors[0]}</span>
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {product.colors.length} Color Swatches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => {
                      const isSelected = (selectedColor || product.colors[0]) === c;
                      const hex = getColorHex(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? "bg-plum text-white border-plum shadow-xs font-extrabold ring-2 ring-plum/30"
                              : "bg-white text-gray-800 border-gray-300 hover:border-plum"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes?.length > 0 && (() => {
                const uniqueSizes = Array.from(
                  new Set(
                    product.sizes.map((s) => (typeof s === "object" ? s.label : String(s)))
                  )
                );

                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-900">Select Size Variant:</span>
                      {sizeError && (
                        <span className="text-crimson font-bold text-[11px]">
                          Please choose a size option
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map((szLabel) => {
                        const exactVar = product.sizes.find(
                          (v) =>
                            typeof v === "object" &&
                            String(v.label) === String(szLabel) &&
                            (!v.color || !selectedColor || String(v.color).toLowerCase() === String(selectedColor).toLowerCase())
                        ) || product.sizes.find((v) => typeof v === "object" && String(v.label) === String(szLabel));

                        const szStock = exactVar && exactVar.stock !== undefined ? parseInt(exactVar.stock, 10) : 10;
                        const isSelected = selectedSize === szLabel;
                        const szOut = szStock <= 0;

                        return (
                          <button
                            key={szLabel}
                            type="button"
                            disabled={szOut}
                            onClick={() => {
                              if (!szOut) {
                                setSelectedSize(szLabel);
                                setSizeError(false);
                              }
                            }}
                            className={`h-10 min-w-[44px] px-3.5 rounded-lg text-xs font-bold transition-all border ${
                              isSelected && !szOut
                                ? "bg-plum text-white border-plum shadow-xs font-black ring-2 ring-plum/30"
                                : szOut
                                ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed opacity-60"
                                : "bg-white text-gray-800 border-gray-300 hover:border-plum cursor-pointer"
                            }`}
                            title={szOut ? `${szLabel} (Out of Stock)` : `${szLabel} (${szStock} left)`}
                          >
                            {szLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Desktop Quantity Stepper & Add to Bag */}
              <div className="hidden sm:block pt-3 space-y-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-300 rounded-xl h-12 bg-white px-2 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={decrementQty}
                      disabled={qty <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                      className="w-8 h-full flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 rounded-lg disabled:opacity-30 cursor-pointer text-base"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-sm text-gray-900 font-sans">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={incrementQty}
                      disabled={qty >= 10 || isOutOfStock}
                      aria-label="Increase quantity"
                      className="w-8 h-full flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 rounded-lg disabled:opacity-30 cursor-pointer text-base"
                    >
                      +
                    </button>
                  </div>

                  {/* Desktop Add to Bag Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                      isOutOfStock
                        ? "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed shadow-none"
                        : "bg-plum hover:bg-plum-900 text-white cursor-pointer active:scale-98"
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check size={20} weight="bold" /> Added to Bag!
                      </>
                    ) : isOutOfStock ? (
                      <>
                        <Handbag size={20} weight="bold" /> Out of Stock
                      </>
                    ) : (
                      <>
                        <Handbag size={20} weight="bold" /> Add to Bag · {formatPrice(product.price * qty)}
                      </>
                    )}
                  </button>
                </div>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="w-full text-center text-xs font-bold text-plum hover:underline py-1.5 flex items-center justify-center gap-1"
                >
                  View Full Product Details & Sizing Guide <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bottom Bar (Always Visible at Screen Bottom) */}
        <div className="sm:hidden p-3 bg-white border-t border-gray-200 shrink-0 space-y-2 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] z-40">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-xl h-11 bg-white px-1 shrink-0">
              <button
                type="button"
                onClick={decrementQty}
                disabled={qty <= 1 || isOutOfStock}
                aria-label="Decrease quantity"
                className="w-7 h-full flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer text-base"
              >
                -
              </button>
              <span className="w-6 text-center font-black text-xs text-gray-900 font-sans">
                {qty}
              </span>
              <button
                type="button"
                onClick={incrementQty}
                disabled={qty >= 10 || isOutOfStock}
                aria-label="Increase quantity"
                className="w-7 h-full flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer text-base"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 h-11 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed shadow-none"
                  : "bg-plum hover:bg-plum-900 text-white cursor-pointer active:scale-98"
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check size={18} weight="bold" /> Added!
                </>
              ) : isOutOfStock ? (
                <>
                  <Handbag size={18} weight="bold" /> Out of Stock
                </>
              ) : (
                <>
                  <Handbag size={18} weight="bold" /> Add to Bag · {formatPrice(product.price * qty)}
                </>
              )}
            </button>
          </div>

          <Link
            href={`/product/${product.slug}`}
            onClick={onClose}
            className="w-full text-center text-[11px] font-bold text-plum hover:underline block pt-0.5"
          >
            View Full Product Details & Sizing Guide →
          </Link>
        </div>
      </div>
    </div>
  );
}

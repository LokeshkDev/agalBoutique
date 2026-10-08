"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, Handbag, Check } from "@phosphor-icons/react";
import { formatPrice, discountPercent, getColorHex } from "@/lib/format";
import { useCart } from "@/store/cart";

export default function QuickViewModal({ product, open, onClose }) {
  const defaultSize =
    product?.sizes?.find((s) => s.stock > 0)?.label ||
    product?.sizes?.[0]?.label ||
    "Free Size";

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || ""
  );
  const [qty, setQty] = useState(1);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const addItem = useCart((s) => s.add);

  if (!open || !product) return null;

  const discount = discountPercent(product.price, product.mrp);
  const currentImg = product.images?.[selectedImgIdx]?.url || product.images?.[0]?.url;

  const decrementQty = () => setQty((prev) => Math.max(1, prev - 1));
  const incrementQty = () => setQty((prev) => Math.min(10, prev + 1));

  const handleAddToCart = () => {
    const finalSize =
      selectedSize ||
      product?.sizes?.find((s) => s.stock > 0)?.label ||
      product?.sizes?.[0]?.label ||
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
      image: product.images?.[0]?.url,
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-[16px] sm:rounded-[5px] max-h-[90vh] overflow-y-auto shadow-2xl transition-transform duration-200 animate-slideUp sm:animate-scaleUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-700 hover:text-black cursor-pointer"
        >
          <X size={18} weight="bold" />
        </button>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            {/* Left: Image & Thumbnails */}
            <div className="sm:col-span-5 space-y-2">
              <div className="relative aspect-[3/4] w-full rounded-[5px] overflow-hidden bg-gray-50">
                <Image
                  src={currentImg}
                  alt={product.name}
                  fill
                  sizes="(max-width: 639px) 100vw, 250px"
                  className="object-cover"
                />
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImgIdx(idx)}
                      className={`relative w-12 h-14 rounded-[5px] overflow-hidden shrink-0 transition-all ${
                        selectedImgIdx === idx ? "ring-2 ring-plum" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-plum uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug mt-0.5">
                  {product.name}
                </h3>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-extrabold text-gray-900 font-sans">
                  {formatPrice(product.price)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.mrp)}
                    </span>
                    <span className="text-sm font-bold text-[#038a41]">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>

              {/* Free Delivery Badge */}
              <div>
                <span className="text-xs font-bold text-[#038a41] bg-[#e6f4ea] px-2.5 py-1 rounded-[5px] inline-block">
                  Free Delivery Across India
                </span>
              </div>

              {/* Fabric note */}
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                Fabric: <strong className="text-gray-900">{product.fabric}</strong>. {product.description}
              </p>

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-900">
                      Color: <span className="text-plum font-extrabold">{selectedColor || product.colors[0]}</span>
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {product.colors.length} Available
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
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? "bg-plum/10 text-plum border-plum ring-1 ring-plum shadow-xs font-extrabold"
                              : "bg-white text-gray-700 border-gray-300 hover:border-plum"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes?.length > 0 && (() => {
                const uniqueSizes = Array.from(
                  new Set(
                    product.sizes.map((s) => (typeof s === "object" ? s.label : String(s)))
                  )
                );

                return (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-900">Select Size:</span>
                      {sizeError && (
                        <span className="text-crimson font-bold text-[11px]">
                          Please choose a size
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
                            className={`h-9 min-w-[40px] px-3 rounded-[5px] text-xs font-bold transition-all border ${
                              isSelected && !szOut
                                ? "bg-plum text-white border-plum shadow-xs font-extrabold"
                                : szOut
                                ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed opacity-60"
                                : "bg-white text-gray-800 border-gray-300 hover:border-plum cursor-pointer"
                            }`}
                            title={szOut ? `${szLabel} (Out of Stock)` : szLabel}
                          >
                            {szLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* CTA Buttons & Quantity Stepper */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-300 rounded-[5px] h-11 bg-white px-1 shrink-0">
                    <button
                      type="button"
                      onClick={decrementQty}
                      disabled={qty <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                      className="w-7 h-full flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-gray-900 font-sans">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={incrementQty}
                      disabled={qty >= 10 || isOutOfStock}
                      aria-label="Increase quantity"
                      className="w-7 h-full flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-11 rounded-[5px] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                      isOutOfStock
                        ? "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed shadow-none"
                        : "bg-[#9c27b0] hover:bg-[#8e24aa] text-white cursor-pointer active:scale-98"
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check size={18} weight="bold" /> Added to Bag!
                      </>
                    ) : isOutOfStock ? (
                      <>
                        <Handbag size={18} weight="bold" /> Out of Stock
                      </>
                    ) : (
                      <>
                        <Handbag size={18} weight="bold" /> Add to Bag
                      </>
                    )}
                  </button>
                </div>

                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="w-full text-center text-xs font-bold text-plum hover:underline py-1.5 block"
                >
                  View Full Product Details & Sizing Guide →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


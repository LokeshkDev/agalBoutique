"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { Heart, Handbag, Scissors, Check, Lightning } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { getColorHex } from "@/lib/format";

export default function ProductActions({ product }) {
  const router = useRouter();
  const defaultSize =
    product.sizes?.find((s) => s.stock > 0)?.label ||
    product.sizes?.[0]?.label ||
    "Free Size";

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [customStitching, setCustomStitching] = useState(false);
  const [measurements, setMeasurements] = useState({
    bust: "",
    waist: "",
    blouseLength: "",
    neckType: "Round Neck",
  });

  const addItem = useCart((s) => s.add);

  const isStitchable =
    product.category === "Blouses" ||
    product.category === "Sarees" ||
    product.category === "Lehengas";

  const decrementQty = () => setQty((prev) => Math.max(1, prev - 1));
  const incrementQty = () => setQty((prev) => Math.min(10, prev + 1));

  const handleAddToCart = (redirectCheckout = false) => {
    const finalSize =
      selectedSize ||
      product.sizes?.find((s) => s.stock > 0)?.label ||
      product.sizes?.[0]?.label ||
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
      customStitching: customStitching ? measurements : null,
    });

    if (redirectCheckout) {
      router.push("/checkout");
    }
  };

  return (
    <div className="space-y-5">
      {/* Color Variant Selection Area */}
      {product.colors?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Color:{" "}
              <span className="text-plum font-extrabold normal-case">
                {selectedColor || product.colors[0]}
              </span>
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {product.colors.length} {product.colors.length === 1 ? "Option" : "Options"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => {
              const isSelected = (selectedColor || product.colors[0]) === c;
              const hex = getColorHex(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[5px] text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-plum/10 text-plum border-plum ring-1 ring-plum shadow-xs font-extrabold"
                      : "bg-white text-gray-700 border-gray-300 hover:border-plum"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection Area */}
      {product.sizes?.length > 0 && (
        <div id="size-selection-area" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Select Size:
            </span>
            <button
              type="button"
              onClick={() =>
                alert(
                  "Size Chart:\nXS: 32 in\nS: 34 in\nM: 36 in\nL: 38 in\nXL: 40 in\nXXL: 42 in"
                )
              }
              className="text-xs text-plum font-bold hover:underline cursor-pointer"
            >
              Size Guide
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const isSelected = selectedSize === s.label;
              const isOutOfStock = s.stock <= 0;
              return (
                <button
                  key={s.label}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    if (!isOutOfStock) {
                      setSelectedSize(s.label);
                      setSizeError(false);
                    }
                  }}
                  className={`h-10 min-w-[44px] px-3.5 rounded-[5px] text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-plum text-white border-plum shadow-xs"
                      : isOutOfStock
                      ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed"
                      : "bg-white text-gray-800 border-gray-300 hover:border-plum"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {sizeError && (
            <p className="text-xs text-crimson font-bold animate-pulse">
              Please select a size to proceed
            </p>
          )}
        </div>
      )}

      {/* Custom Stitching Option */}
      {isStitchable && (
        <div className="p-3.5 rounded-[5px] bg-[#faf5f8] border border-[#f3e3ee] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors size={18} className="text-plum" />
              <span className="text-xs font-bold text-gray-900">
                Need Custom Blouse / Saree Stitching?
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCustomStitching(!customStitching)}
              className={`w-5 h-5 rounded-[3px] border flex items-center justify-center transition-colors cursor-pointer ${
                customStitching
                  ? "bg-plum border-plum text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {customStitching && <Check size={14} weight="bold" />}
            </button>
          </div>

          {customStitching && (
            <div className="pt-2 border-t border-plum/10 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-gray-600 block mb-1 font-medium">
                  Bust (inches)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 36"
                  value={measurements.bust}
                  onChange={(e) =>
                    setMeasurements({ ...measurements, bust: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-[5px] border border-gray-200 bg-white text-ink text-xs focus:outline-none focus:border-plum"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-600 block mb-1 font-medium">
                  Waist (inches)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30"
                  value={measurements.waist}
                  onChange={(e) =>
                    setMeasurements({ ...measurements, waist: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-[5px] border border-gray-200 bg-white text-ink text-xs focus:outline-none focus:border-plum"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-gray-600 block mb-1 font-medium">
                  Neckline Pattern
                </label>
                <select
                  value={measurements.neckType}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      neckType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-[5px] border border-gray-200 bg-white text-ink text-xs focus:outline-none focus:border-plum"
                >
                  <option>Round Neck with Piping</option>
                  <option>Boat Neck with Back Hooks</option>
                  <option>Sweetheart Neck</option>
                  <option>V-Neck Front & Deep Back</option>
                  <option>High Collar / Princess Cut</option>
                </select>
              </div>
              <p className="col-span-2 text-[11px] text-gray-500 mt-0.5">
                Stitched by master tailors in Tamil Nadu. Dispatched in 3–5 days.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Desktop Main Actions: SINGLE CLEAN ROW with Quantity Stepper + Add to Bag + Buy Now + Wishlist */}
      <div className="hidden lg:flex items-center gap-3 pt-2">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-gray-300 rounded-[5px] h-12 bg-white px-1 shrink-0">
          <button
            type="button"
            onClick={decrementQty}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="w-8 h-full flex items-center justify-center text-gray-700 hover:text-plum disabled:opacity-30 cursor-pointer font-bold text-base select-none"
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-sm text-gray-900 font-sans select-none">
            {qty}
          </span>
          <button
            type="button"
            onClick={incrementQty}
            disabled={qty >= 10}
            aria-label="Increase quantity"
            className="w-8 h-full flex items-center justify-center text-gray-700 hover:text-plum disabled:opacity-30 cursor-pointer font-bold text-base select-none"
          >
            +
          </button>
        </div>

        {/* Add to Bag Button */}
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          className="flex-1 h-12 rounded-[5px] bg-[#9c27b0] hover:bg-[#8e24aa] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer active:scale-98"
        >
          <Handbag size={18} weight="bold" />
          Add to Bag
        </button>

        {/* Buy Now Button */}
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="flex-1 h-12 rounded-[5px] bg-[#e3174b] hover:bg-[#c20f3d] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer active:scale-98"
        >
          <Lightning size={18} weight="bold" />
          Buy Now
        </button>

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setWishlisted(!wishlisted)}
          className={`h-12 w-12 rounded-[5px] border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            wishlisted
              ? "bg-plum-50 border-crimson text-crimson"
              : "bg-white border-gray-300 text-gray-700 hover:border-plum"
          }`}
        >
          <Heart
            size={22}
            weight={wishlisted ? "fill" : "regular"}
            className={wishlisted ? "text-crimson" : "currentColor"}
          />
        </button>
      </div>

      {/* Mobile/Tablet Inline Action Row */}
      <div className="lg:hidden flex items-center gap-2 pt-2">
        {/* Mobile Inline Stepper */}
        <div className="flex items-center border border-gray-300 rounded-[5px] h-11 bg-white px-1 shrink-0">
          <button
            type="button"
            onClick={decrementQty}
            disabled={qty <= 1}
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
            disabled={qty >= 10}
            aria-label="Increase quantity"
            className="w-7 h-full flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Add to Bag */}
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          className="flex-1 h-11 rounded-[5px] bg-[#9c27b0] active:bg-[#8e24aa] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Handbag size={16} weight="bold" />
          Add to Bag
        </button>

        {/* Buy Now */}
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="flex-1 h-11 rounded-[5px] bg-[#e3174b] active:bg-[#c20f3d] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Lightning size={16} weight="bold" />
          Buy Now
        </button>

        {/* Wishlist */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setWishlisted(!wishlisted)}
          className={`h-11 w-11 rounded-[5px] border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            wishlisted
              ? "bg-plum-50 border-crimson text-crimson"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <Heart
            size={18}
            weight={wishlisted ? "fill" : "regular"}
            className={wishlisted ? "text-crimson" : "currentColor"}
          />
        </button>
      </div>

      {/* Floating/Sticky Mobile Action Bar (Pinned cleanly at bottom on mobile/tablet) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex items-center gap-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
        {/* Quantity Stepper in Sticky Bar */}
        <div className="flex items-center border border-gray-300 rounded-[5px] h-10 bg-white px-1 shrink-0">
          <button
            type="button"
            onClick={decrementQty}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="w-7 h-full flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer text-sm"
          >
            -
          </button>
          <span className="w-6 text-center font-bold text-xs text-gray-900 font-sans">
            {qty}
          </span>
          <button
            type="button"
            onClick={incrementQty}
            disabled={qty >= 10}
            aria-label="Increase quantity"
            className="w-7 h-full flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer text-sm"
          >
            +
          </button>
        </div>

        {/* Add to Bag Button in Sticky Bar */}
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          className="flex-1 h-10 rounded-[5px] bg-[#9c27b0] active:bg-[#8e24aa] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Handbag size={16} weight="bold" />
          Add to Bag
        </button>

        {/* Buy Now Button in Sticky Bar */}
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="flex-1 h-10 rounded-[5px] bg-[#e3174b] active:bg-[#c20f3d] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Lightning size={16} weight="bold" />
          Buy Now
        </button>
      </div>
    </div>
  );
}

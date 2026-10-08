"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { Handbag, Ruler, CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { getColorHex, formatPrice } from "@/lib/format";
import SizeGuideModal from "@/components/SizeGuideModal";

export default function ProductActions({ product }) {
  const router = useRouter();
  const defaultSize =
    (Array.isArray(product.sizes) && product.sizes.find((s) => (typeof s === "object" ? s.stock > 0 : true))?.label) ||
    (Array.isArray(product.sizes) && (typeof product.sizes[0] === "object" ? product.sizes[0]?.label : product.sizes[0])) ||
    "Free Size";

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const addItem = useCart((s) => s.add);

  // Find exact matching variant from product sizes matrix
  const matchingVariant = Array.isArray(product.sizes)
    ? product.sizes.find((s) => {
        if (typeof s !== "object") return String(s) === String(selectedSize);
        const matchSize = String(s.label) === String(selectedSize);
        const matchColor = !s.color || !selectedColor || String(s.color).toLowerCase() === String(selectedColor).toLowerCase();
        return matchSize && matchColor;
      }) || product.sizes.find((s) => typeof s === "object" && String(s.label) === String(selectedSize))
    : null;

  const variantStock = matchingVariant && typeof matchingVariant === "object" && matchingVariant.stock !== undefined
    ? parseInt(matchingVariant.stock, 10)
    : 10;

  const variantPrice = matchingVariant && typeof matchingVariant === "object" && matchingVariant.price
    ? parseFloat(matchingVariant.price)
    : product.price;

  const isOutOfStock = variantStock <= 0;

  const decrementQty = () => setQty((prev) => Math.max(1, prev - 1));
  const incrementQty = () => setQty((prev) => Math.min(10, prev + 1));

  const handleAddToCart = (redirectCheckout = false) => {
    if (isOutOfStock) return;
    const finalSize = selectedSize || defaultSize;
    setSizeError(false);

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: variantPrice,
      mrp: product.mrp,
      size: finalSize,
      color: selectedColor || product.colors?.[0] || "",
      qty: qty,
      image: product.images?.[0]?.url,
      images: product.images,
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
      {product.sizes?.length > 0 && (() => {
        const uniqueSizes = Array.from(
          new Set(
            product.sizes.map((s) => (typeof s === "object" ? s.label : String(s)))
          )
        );

        return (
          <div id="size-selection-area" className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Select Size:
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-xs text-plum font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Ruler size={15} /> Size Guide
              </button>
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
                    className={`h-10 min-w-[44px] px-3.5 rounded-[5px] text-xs font-bold transition-all border relative ${
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

            {/* Dynamic Variant Price & Inventory Stock Indicator */}
            <div className="pt-1 flex items-center justify-between text-xs">
              {isOutOfStock ? (
                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  ❌ Out of Stock for selected size/color
                </span>
              ) : variantStock <= 3 ? (
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                  ⚡ Only {variantStock} left in stock for {selectedSize}!
                </span>
              ) : (
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ In Stock ({variantStock} available)
                </span>
              )}

              {variantPrice !== product.price && (
                <span className="font-extrabold text-plum text-sm">
                  Variant Price: {formatPrice(variantPrice)}
                </span>
              )}
            </div>

            {sizeError && (
              <p className="text-xs text-crimson font-bold animate-pulse">
                Please select a size to proceed
              </p>
            )}
          </div>
        );
      })()}

      {/* Size Guide Modal Popup */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />

      {/* Desktop Main Actions: SINGLE CLEAN ROW with Quantity Stepper + Add to Bag */}
      <div className="hidden lg:flex items-center gap-3 pt-2">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-gray-300 rounded-[5px] h-12 bg-white px-1 shrink-0">
          <button
            type="button"
            onClick={decrementQty}
            disabled={qty <= 1 || isOutOfStock}
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
            disabled={qty >= 10 || isOutOfStock}
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
          disabled={isOutOfStock}
          className={`flex-1 h-12 rounded-[5px] font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed shadow-none"
              : "bg-[#9c27b0] hover:bg-[#8e24aa] text-white cursor-pointer active:scale-98"
          }`}
        >
          <Handbag size={18} weight="bold" />
          {isOutOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>

      {/* Floating/Sticky Mobile Action Bar (Pinned cleanly at bottom on mobile/tablet) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex items-center gap-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
        {/* Quantity Stepper in Sticky Bar */}
        <div className="flex items-center border border-gray-300 rounded-[5px] h-10 bg-white px-1 shrink-0">
          <button
            type="button"
            onClick={decrementQty}
            disabled={qty <= 1 || isOutOfStock}
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
            disabled={qty >= 10 || isOutOfStock}
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
          disabled={isOutOfStock}
          className={`flex-1 h-10 rounded-[5px] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed shadow-none"
              : "bg-[#9c27b0] active:bg-[#8e24aa] text-white cursor-pointer"
          }`}
        >
          <Handbag size={16} weight="bold" />
          {isOutOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}

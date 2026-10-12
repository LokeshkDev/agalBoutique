"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { Handbag, Ruler, CheckCircle, Sparkle, WarningCircle, X } from "@phosphor-icons/react";
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
  const [stockAlert, setStockAlert] = useState({ open: false, title: "", message: "" });

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
  const incrementQty = () => {
    if (variantStock === 1) {
      setStockAlert({
        open: true,
        title: "Only 1 Item Available",
        message: `Only 1 piece is in stock for size ${selectedSize || defaultSize}. You cannot add more than 1 item.`,
      });
      return;
    }
    setQty((prev) => Math.min(Math.min(10, variantStock), prev + 1));
  };

  const handleAddToCart = (redirectCheckout = false) => {
    if (isOutOfStock) return;
    const finalSize = selectedSize || defaultSize;
    setSizeError(false);

    // Check if item has only 1 qty in stock
    const cartItems = useCart.getState().items;
    const existingInCart = cartItems.find(
      (item) =>
        String(item.id) === String(product.id) &&
        String(item.size) === String(finalSize) &&
        (!selectedColor || String(item.color).toLowerCase() === String(selectedColor).toLowerCase())
    );

    if (variantStock === 1) {
      if (existingInCart && existingInCart.qty >= 1) {
        setStockAlert({
          open: true,
          title: "Only 1 Item Available",
          message: `There is only 1 item in stock for size ${finalSize}, and it is already in your shopping bag!`,
        });
        return;
      }

      // Add the single available item to bag
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: variantPrice,
        mrp: product.mrp,
        size: finalSize,
        color: selectedColor || product.colors?.[0] || "",
        qty: 1,
        image: product.images?.[0]?.url,
        images: product.images,
      });

      // Show theme alert message
      setStockAlert({
        open: true,
        title: "Only 1 Item Left in Stock!",
        message: `Hurry! There is only 1 item remaining in stock for size ${finalSize}. We have reserved the last available piece in your shopping bag.`,
      });

      if (redirectCheckout) {
        router.push("/checkout");
      }
      return;
    }

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

      {/* Main Actions: Quantity Stepper + Add to Bag (Visible on Mobile & Desktop next to PIN code section) */}
      <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-gray-300 rounded-[5px] h-11 sm:h-12 bg-white px-1 shrink-0">
          <button
            type="button"
            onClick={decrementQty}
            disabled={qty <= 1 || isOutOfStock}
            aria-label="Decrease quantity"
            className="w-7 sm:w-8 h-full flex items-center justify-center text-gray-700 hover:text-plum disabled:opacity-30 cursor-pointer font-bold text-sm sm:text-base select-none"
          >
            -
          </button>
          <span className="w-7 sm:w-8 text-center font-bold text-xs sm:text-sm text-gray-900 font-sans select-none">
            {qty}
          </span>
          <button
            type="button"
            onClick={incrementQty}
            disabled={qty >= 10 || isOutOfStock}
            aria-label="Increase quantity"
            className="w-7 sm:w-8 h-full flex items-center justify-center text-gray-700 hover:text-plum disabled:opacity-30 cursor-pointer font-bold text-sm sm:text-base select-none"
          >
            +
          </button>
        </div>

        {/* Add to Bag Button */}
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={isOutOfStock}
          className={`flex-1 h-11 sm:h-12 rounded-[5px] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed shadow-none"
              : "bg-[#9c27b0] hover:bg-[#8e24aa] text-white cursor-pointer active:scale-98"
          }`}
        >
          <Handbag size={18} weight="bold" />
          {isOutOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>



      {/* THEME DESIGNED STOCK ALERT POPUP MODAL */}
      {stockAlert.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-purple-200 text-center space-y-4 font-sans animate-scale-in relative">
            <button
              type="button"
              onClick={() => setStockAlert({ open: false, title: "", message: "" })}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close alert"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="w-14 h-14 rounded-full bg-purple-50 text-plum mx-auto flex items-center justify-center border border-purple-200">
              <Sparkle size={28} weight="fill" className="text-amber-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                {stockAlert.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                {stockAlert.message}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setStockAlert({ open: false, title: "", message: "" });
                  useCart.getState().openCart();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-plum hover:bg-plum-900 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Handbag size={16} weight="bold" />
                <span>View In Bag</span>
              </button>
              <button
                type="button"
                onClick={() => setStockAlert({ open: false, title: "", message: "" })}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

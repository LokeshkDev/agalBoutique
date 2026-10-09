"use client";

import { normalizeImageUrl, getCmsSettings } from "@/lib/api";

import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCart } from "@/store/cart";
import Sheet from "@/components/Sheet";
import Button from "@/components/Button";
import { formatPrice } from "@/lib/format";
import { Minus, Plus, Trash, Tote } from "@phosphor-icons/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function CartSheet() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const { items, open } = useCart(
    useShallow((s) => ({ items: s.items || [], open: s.open }))
  );
  const { closeCart, setQty, remove } = useCart(
    useShallow((s) => ({
      closeCart: s.closeCart,
      setQty: s.setQty,
      remove: s.remove,
    }))
  );

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [freeThreshold, setFreeThreshold] = useState(999);

  useEffect(() => {
    getCmsSettings().then((res) => {
      if (res?.settings?.delivery_settings?.freeThreshold !== undefined) {
        setFreeThreshold(Number(res.settings.delivery_settings.freeThreshold));
      }
    });
  }, []);

  const totalQuantity = items.reduce(
    (acc, i) => acc + (i.qty || i.quantity || 1),
    0
  );
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (item.qty || item.quantity || 1),
    0
  );
  const mrpTotal = items.reduce(
    (sum, item) =>
      sum + (item.mrp || item.price) * (item.qty || item.quantity || 1),
    0
  );
  const savings = mrpTotal - subtotal;

  const amountToFreeDelivery = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(
    100,
    (subtotal / freeThreshold) * 100
  );

  return (
    <Sheet
      open={open}
      onClose={closeCart}
      title={`Your bag · ${totalQuantity}`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center my-auto">
          <div className="w-16 h-16 rounded-full bg-pink-50 grid place-items-center mb-4 text-[#8a2a6f]">
            <Tote size={36} weight="light" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 font-sans">
            Your bag is empty
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-xs leading-relaxed font-sans">
            Handcrafted sarees, stitched blouses & festive kurtis are waiting for you.
          </p>
          <Button
            href="/shop"
            onClick={closeCart}
            variant="primary"
            className="w-full"
          >
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Free delivery progress */}
          <div className="p-4 bg-blush border-b border-line shrink-0">
            <p className="text-xs text-ink mb-1.5 font-sans font-medium">
              {amountToFreeDelivery > 0
                ? `Add ${formatPrice(amountToFreeDelivery)} more for free delivery`
                : "You have qualified for Free Delivery!"}
            </p>
            <div className="h-1.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-plum transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Line items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((item) => {
              const currentQty = item.qty || item.quantity || 1;
              const imageUrl = normalizeImageUrl(item.image || item.images?.[0]);

              return (
                <div
                  key={`${item.id}-${item.size}-${item.color || ""}`}
                  className="flex gap-3.5 pb-4 border-b border-line last:border-0"
                >
                  <div className="relative w-16 h-[86px] rounded-lg overflow-hidden shrink-0 bg-blush">
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-ink line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted mt-0.5">
                          Size: <span className="font-medium text-ink">{item.size}</span>
                          {item.color && (
                            <span className="ml-2">
                              · Color: <span className="font-medium text-ink">{item.color}</span>
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.id, item.size, item.color)}
                        className="text-muted hover:text-crimson transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash size={18} weight="light" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Stepper */}
                      <div className="flex items-center border border-line rounded-full bg-ivory">
                        <button
                          onClick={() =>
                            setQty(item.id, item.size, Math.max(1, currentQty - 1), item.color)
                          }
                          disabled={currentQty <= 1}
                          className="w-8 h-8 flex items-center justify-center text-ink disabled:opacity-30 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-ink">
                          {currentQty}
                        </span>
                        <button
                          onClick={() =>
                            setQty(item.id, item.size, Math.min(10, currentQty + 1), item.color)
                          }
                          disabled={currentQty >= 10}
                          className="w-8 h-8 flex items-center justify-center text-ink disabled:opacity-30 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="block text-sm font-semibold text-ink font-sans">
                          {formatPrice(item.price * currentQty)}
                        </span>
                        {item.mrp && item.mrp > item.price && (
                          <span className="block text-[11px] text-muted line-through">
                            {formatPrice(item.mrp * currentQty)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Coupon section */}
            <div className="pt-2">
              {!showCoupon ? (
                <button
                  type="button"
                  onClick={() => setShowCoupon(true)}
                  className="text-xs font-semibold text-plum hover:underline cursor-pointer py-2 block"
                >
                  Have a coupon code?
                </button>
              ) : (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AGAL10"
                    className="flex-1 border border-line rounded-full px-4 py-2 text-xs text-ink bg-ivory focus:outline-none focus:border-plum uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (couponCode.trim()) setCouponApplied(true);
                    }}
                    className="px-4 py-2 rounded-full bg-plum text-ivory text-xs font-semibold hover:bg-plum-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponApplied && (
                <p className="text-[11px] text-leaf mt-1.5 font-medium">
                  Coupon {couponCode} applied! (Demo discount)
                </p>
              )}
            </div>
          </div>

          {/* Sticky footer */}
          <div className="p-4 bg-ivory border-t border-line mt-auto">
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider font-sans">Subtotal</p>
                {savings > 0 && (
                  <p className="text-xs text-leaf font-medium mt-0.5 font-sans">
                    You save {formatPrice(savings)}
                  </p>
                )}
              </div>
              <p className="font-sans text-2xl text-[#3a1233] font-extrabold">
                {formatPrice(subtotal)}
              </p>
            </div>

            <Button
              href="/checkout"
              onClick={closeCart}
              variant="action"
              fullWidth
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

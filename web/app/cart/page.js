"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";
import { useCart } from "@/store/cart";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { formatPrice, discountPercent } from "@/lib/format";
import { normalizeImageUrl, getCmsSettings } from "@/lib/api";
import {
  Tote,
  Trash,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkle,
  Lock,
} from "@phosphor-icons/react";

export default function CartPage() {
  const { items } = useCart(useShallow((s) => ({ items: s.items || [] })));
  const { setQty, remove, clear } = useCart(
    useShallow((s) => ({
      setQty: s.setQty,
      remove: s.remove,
      clear: s.clear,
    }))
  );

  const [hydrated, setHydrated] = useState(false);
  const [freeThreshold, setFreeThreshold] = useState(999);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    setHydrated(true);
    getCmsSettings().then((res) => {
      const d = res?.settings?.delivery_settings;
      const threshold = d?.online?.freeThreshold ?? d?.freeThreshold;
      if (threshold !== undefined) {
        setFreeThreshold(Number(threshold));
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
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);

  if (!hydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-10 h-10 border-3 border-plum border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          Loading your bag...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-6 lg:py-10 space-y-6 font-sans">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 font-medium">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-plum transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-bold">Shopping Bag</li>
          </ol>
        </nav>

        {items.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-plum/5 text-plum grid place-items-center mx-auto shadow-xs">
              <Tote size={44} weight="light" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Your Shopping Bag is Empty
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Explore our plus size varieties, western wear, tops with dupatta, and festive collections to add your favorites.
            </p>
            <Button href="/shop" variant="primary" className="rounded-xl px-8">
              Explore Collections
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Line Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Bar */}
              <div className="p-4 bg-blush border border-line rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-ink mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Truck size={16} className="text-plum" />
                    {amountToFreeDelivery > 0
                      ? `Add ${formatPrice(amountToFreeDelivery)} more for FREE Delivery`
                      : "You have unlocked FREE Express Delivery!"}
                  </span>
                  <span className="text-plum">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden border border-line/40">
                  <div
                    className="h-full bg-plum transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-xs">
                <div className="p-4 bg-gray-50/70 flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Items in Bag ({totalQuantity})</span>
                  <button
                    onClick={() => clear()}
                    className="text-red-600 hover:underline cursor-pointer text-[11px]"
                  >
                    Clear All
                  </button>
                </div>

                {items.map((item) => {
                  const itemQty = item.qty || item.quantity || 1;
                  const itemImg = normalizeImageUrl(
                    item.image || item.images?.[0]?.url || item.images?.[0]
                  );
                  const itemTotal = item.price * itemQty;

                  return (
                    <div
                      key={`${item.id}-${item.size}-${item.color || ""}`}
                      className="p-4 sm:p-5 flex gap-4 items-start hover:bg-gray-50/40 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <Link
                        href={`/product/${item.slug || item.id}`}
                        className="relative w-20 h-26 sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0"
                      >
                        <Image
                          src={itemImg}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.slug || item.id}`}
                              className="font-bold text-sm sm:text-base text-gray-900 hover:text-plum line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => remove(item.id, item.size, item.color)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash size={16} />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-700">
                              Size: {item.size || "Free Size"}
                            </span>
                            {item.color && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-700">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                          {/* Stepper */}
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                setQty(item.id, item.size, Math.max(1, itemQty - 1), item.color)
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              <Minus size={12} weight="bold" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-gray-900">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQty(item.id, item.size, Math.min(10, itemQty + 1), item.color)
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              <Plus size={12} weight="bold" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="font-extrabold text-sm sm:text-base text-plum block">
                              {formatPrice(itemTotal)}
                            </span>
                            {item.mrp && item.mrp > item.price && (
                              <span className="text-[11px] text-gray-400 line-through">
                                {formatPrice(item.mrp * itemQty)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary Box */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Lock size={18} className="text-plum" />
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal ({totalQuantity} items):</span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-leaf font-bold">
                      <span>Total Savings:</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Delivery:</span>
                    <span className="font-bold text-[#038a41]">
                      {amountToFreeDelivery === 0 ? "FREE" : "Calculated at Checkout"}
                    </span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 h-9 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (couponCode.trim()) setCouponApplied(true);
                      }}
                      className="px-3.5 h-9 bg-plum text-white text-xs font-bold rounded-lg hover:bg-plum-900 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-[11px] text-leaf font-semibold mt-1">
                      Coupon {couponCode} applied successfully!
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-gray-900">Total Payable:</span>
                  <span className="text-xl font-black text-plum">{formatPrice(subtotal)}</span>
                </div>

                <Button href="/checkout" variant="action" fullWidth className="h-12 rounded-xl text-sm font-black shadow-md flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} weight="bold" />
                </Button>

                <div className="pt-2 text-center text-[11px] text-gray-400 space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-gray-600 font-semibold">
                    <ShieldCheck size={16} className="text-[#038a41]" />
                    <span>Safe & Secure RBI-regulated Payments</span>
                  </div>
                  <p>Free returns within 7 days · Easy size exchanges</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton message="Hello Agal Boutique! I would like assistance with my shopping bag items." />
    </>
  );
}


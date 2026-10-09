"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useShallow } from "zustand/react/shallow";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import {
  CheckCircle,
  WhatsappLogo,
  ShieldCheck,
  Lock,
  CaretDown,
  CaretUp,
  MapPin,
  CreditCard,
  Money,
} from "@phosphor-icons/react";

import { submitOrderToBackend, getCmsSettings } from "@/lib/api";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { items, clear } = useCart(
    useShallow((s) => ({ items: s.items || [], clear: s.clear }))
  );

  // Active step: 1 = Address & Contact, 2 = Payment
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [summaryOpenMobile, setSummaryOpenMobile] = useState(false);

  // Address & Contact form state
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    email: "",
    pin: "",
    city: "Chennai",
    state: "Tamil Nadu",
    line1: "",
    tag: "Home",
  });

  // Only 2 payment methods: 'online' or 'cod'
  const [paymentMethod, setPaymentMethod] = useState("online");

  // Dynamic Delivery settings from Admin CMS
  const [deliverySettings, setDeliverySettings] = useState({
    standardFee: 79,
    freeThreshold: 999,
    estimateDays: "3-5 Business Days",
  });

  useEffect(() => {
    getCmsSettings().then((res) => {
      if (res?.settings?.delivery_settings) {
        setDeliverySettings({
          standardFee: Number(res.settings.delivery_settings.standardFee ?? 79),
          freeThreshold: Number(res.settings.delivery_settings.freeThreshold ?? 999),
          estimateDays: res.settings.delivery_settings.estimateDays || "3-5 Business Days",
        });
      }
    });
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (item.qty || item.quantity || 1),
    0
  );
  const shippingFee = subtotal >= deliverySettings.freeThreshold ? 0 : deliverySettings.standardFee;
  const codFee = 0;
  const total = subtotal + shippingFee;

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (
      address.name.trim() &&
      address.phone.trim().length >= 10 &&
      address.email.trim() &&
      address.pin.trim().length >= 6 &&
      address.line1.trim()
    ) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    const payload = {
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        slug: i.slug,
        price: i.price,
        mrp: i.mrp,
        size: i.size,
        color: i.color,
        qty: i.qty || i.quantity || 1,
        image: i.image || i.images?.[0]?.url,
        customStitching: i.customStitching || null,
      })),
      shippingAddress: address,
      paymentMethod,
    };

    const backendRes = await submitOrderToBackend(payload);
    const finalOrderNum =
      backendRes?.orderNumber ||
      backendRes?.order?.orderNumber ||
      "AGAL-" + Math.floor(100000 + Math.random() * 900000);

    setOrderNumber(finalOrderNum);
    setOrderComplete(true);
    clear();
  };

  // Auto-fill city/state from PIN
  const handlePinChange = (e) => {
    const pin = e.target.value.replace(/\D/g, "");
    let city = address.city;
    let state = address.state;

    if (pin.startsWith("600")) {
      city = "Chennai";
      state = "Tamil Nadu";
    } else if (pin.startsWith("641")) {
      city = "Coimbatore";
      state = "Tamil Nadu";
    } else if (pin.startsWith("625")) {
      city = "Madurai";
      state = "Tamil Nadu";
    } else if (pin.startsWith("620")) {
      city = "Tiruchirappalli";
      state = "Tamil Nadu";
    } else if (pin.startsWith("636")) {
      city = "Salem";
      state = "Tamil Nadu";
    } else if (pin.startsWith("560")) {
      city = "Bengaluru";
      state = "Karnataka";
    } else if (pin.startsWith("500")) {
      city = "Hyderabad";
      state = "Telangana";
    } else if (pin.startsWith("400")) {
      city = "Mumbai";
      state = "Maharashtra";
    } else if (pin.startsWith("110")) {
      city = "New Delhi";
      state = "Delhi";
    }

    setAddress((a) => ({ ...a, pin, city, state }));
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 text-center font-sans">
        <div className="w-20 h-20 rounded-full bg-green-50 text-[#238b45] grid place-items-center mx-auto mb-5 shadow-xs">
          <CheckCircle size={52} weight="fill" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-md mx-auto">
          Thank you, <strong className="text-gray-900">{address.name}</strong>! Your order has been registered and is being handcrafted for dispatch.
        </p>

        <div className="p-5 rounded-[5px] bg-[#fcfafc] border border-[#f3e3ee] text-left text-xs space-y-3 mb-6 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Order Number:</span>
            <span className="font-mono font-extrabold text-plum text-sm">
              {orderNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Recipient Name:</span>
            <span className="font-bold text-gray-900">{address.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Phone Number:</span>
            <span className="font-bold text-gray-900">+91 {address.phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Email ID:</span>
            <span className="font-bold text-gray-900">{address.email}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium">Delivery Address:</span>
            <span className="font-bold text-gray-900 text-right max-w-[240px]">
              {address.line1}, {address.city}, {address.state} - {address.pin} ({address.tag})
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-500 font-medium">Payment Method:</span>
            <span className="font-bold text-gray-900 uppercase">
              {paymentMethod === "online" ? "Online Payment (Paid)" : "Cash on Delivery (Pay on Arrival)"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Total Amount:</span>
            <span className="font-extrabold text-base text-[#3a1233]">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://wa.me/919876543210?text=Hello%20Agal%20Boutique,%20I%20just%20placed%20order%20${orderNumber}%20under%20the%20name%20${encodeURIComponent(address.name)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[46px] px-6 rounded-[5px] bg-[#25D366] text-white font-bold text-xs hover:opacity-95 shadow-xs cursor-pointer"
          >
            <WhatsappLogo size={20} weight="fill" />
            Track on WhatsApp
          </a>

          <Button href="/shop" variant="primary" className="flex-1 rounded-[5px]">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center font-sans">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your Bag is Empty
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Add beautiful handcrafted sarees, kurtis & blouses to your bag before checking out.
        </p>
        <Button href="/shop" variant="primary" className="rounded-[5px]">
          Browse Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-6 lg:py-10 font-sans">
      {/* Mobile Collapsible Summary Bar */}
      <div className="lg:hidden mb-5 rounded-[5px] bg-[#fcfafc] border border-[#f3e3ee] overflow-hidden">
        <button
          type="button"
          onClick={() => setSummaryOpenMobile(!summaryOpenMobile)}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-gray-900 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Lock size={16} className="text-plum" />
            {summaryOpenMobile ? "Hide Order Summary" : "Show Order Summary"} ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
          <span className="flex items-center gap-1 text-sm font-extrabold text-gray-900">
            {formatPrice(total)}
            {summaryOpenMobile ? <CaretUp size={14} /> : <CaretDown size={14} />}
          </span>
        </button>

        {summaryOpenMobile && (
          <div className="p-4 pt-1 border-t border-gray-200 space-y-3 bg-white">
            {items.map((it) => (
              <div
                key={`${it.id}-${it.size}-${it.color || ""}`}
                className="flex justify-between text-xs text-gray-800"
              >
                <span className="line-clamp-1 flex-1 pr-2">
                  {it.name} (x{it.qty || it.quantity || 1}, {it.size})
                </span>
                <span className="font-bold shrink-0">
                  {formatPrice(it.price * (it.qty || it.quantity || 1))}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? "text-[#038a41] font-bold" : "font-bold"}>
                  {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: 2 Clean Sections (Address & Payment) */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Fast & Secure Checkout
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter your delivery details and choose your preferred payment method.
            </p>
          </div>

          {/* SECTION 1: Delivery Address & Contact */}
          <div className="rounded-[5px] border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold grid place-items-center ${
                    step > 1
                      ? "bg-[#238b45] text-white"
                      : "bg-plum text-white"
                  }`}
                >
                  {step > 1 ? "✓" : "1"}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Delivery Address & Contact Details
                </h2>
              </div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-plum font-bold hover:underline cursor-pointer"
                >
                  Edit Address
                </button>
              )}
            </div>

            {step === 1 ? (
              <form onSubmit={handleSaveAddress} className="space-y-4">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Full Name <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sundaram"
                      value={address.name}
                      onChange={(e) =>
                        setAddress({ ...address, name: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Phone Number <span className="text-crimson">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-3 rounded-[5px] border border-gray-300 bg-gray-50 text-xs text-gray-700 font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9876543210"
                        value={address.phone}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            phone: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        required
                        className="flex-1 px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                      />
                    </div>
                  </div>
                </div>

                {/* Email ID & PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Mail ID (Email) <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. priya@example.com"
                      value={address.email}
                      onChange={(e) =>
                        setAddress({ ...address, email: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      PIN Code (6 digits) <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="e.g. 600028"
                      value={address.pin}
                      onChange={handlePinChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                    />
                  </div>
                </div>

                {/* Street Address / Flat / Building */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Flat / House No. / Building / Street Address <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 3B, Agal Nilayam, 4th Cross Street, Anna Nagar"
                    value={address.line1}
                    onChange={(e) =>
                      setAddress({ ...address, line1: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      City / District <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-gray-50 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-plum"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      State <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-gray-50 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-plum"
                    />
                  </div>
                </div>

                {/* Address Tag */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Save Address As
                  </label>
                  <div className="flex gap-2.5">
                    {["Home", "Work", "Other"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAddress({ ...address, tag })}
                        className={`px-4 py-1.5 rounded-[5px] text-xs font-bold border transition-all cursor-pointer ${
                          address.tag === tag
                            ? "bg-plum text-white border-plum shadow-xs"
                            : "bg-white text-gray-700 border-gray-300 hover:border-plum"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="h-11 rounded-[5px] text-sm font-bold shadow-xs cursor-pointer"
                  >
                    Save Address & Continue to Payment →
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pl-10 space-y-1 text-xs text-gray-700">
                <p className="font-bold text-gray-900">
                  {address.name} · +91 {address.phone}
                </p>
                <p className="text-gray-600">Email: {address.email}</p>
                <p className="text-gray-600">
                  {address.line1}, {address.city}, {address.state} - {address.pin} ({address.tag})
                </p>
              </div>
            )}
          </div>

          {/* SECTION 2: Payment Method (Only COD & Online Payment) */}
          <div className="rounded-[5px] border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`w-7 h-7 rounded-full text-xs font-bold grid place-items-center ${
                  step === 2 ? "bg-plum text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Payment Method
              </h2>
            </div>

            {step === 2 ? (
              <div className="space-y-3.5">
                {/* Option 1: Online Payment */}
                <label
                  className={`flex items-start justify-between p-4 rounded-[5px] border cursor-pointer transition-all ${
                    paymentMethod === "online"
                      ? "border-plum bg-plum/5 ring-1 ring-plum shadow-xs"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="accent-plum mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-plum" />
                        <p className="text-xs sm:text-sm font-extrabold text-gray-900">
                          Online Payment (UPI, Cards, Net Banking)
                        </p>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                        Pay securely with Google Pay, PhonePe, Paytm, Debit/Credit Card or Net Banking. Zero extra fees.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#038a41] bg-[#e6f4ea] px-2 py-0.5 rounded-[3px] shrink-0 ml-2">
                    Recommended
                  </span>
                </label>

                {/* Option 2: Cash on Delivery (COD) */}
                <label
                  className={`flex items-start justify-between p-4 rounded-[5px] border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-plum bg-plum/5 ring-1 ring-plum shadow-xs"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-plum mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Money size={18} className="text-gray-700" />
                        <p className="text-xs sm:text-sm font-extrabold text-gray-900">
                          Cash on Delivery (COD)
                        </p>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                        Pay in cash or UPI QR scan at your doorstep upon delivery. Zero extra fee.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#038a41] bg-[#e6f4ea] px-2 py-0.5 rounded-[3px] shrink-0 ml-2">
                    Free COD
                  </span>
                </label>

                <div className="pt-3">
                  <Button
                    type="button"
                    onClick={handlePlaceOrder}
                    variant="action"
                    fullWidth
                    className="h-12 rounded-[5px] text-sm font-extrabold shadow-sm cursor-pointer"
                  >
                    Place Order · {formatPrice(total)}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 pl-10">
                Please complete address and contact details above to choose payment.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 rounded-[5px] border border-gray-200 bg-[#fcfafc] p-6 space-y-5 shadow-xs">
          <h3 className="font-bold text-lg text-gray-900 border-b border-gray-200 pb-3">
            Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
          </h3>

          <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
            {items.map((it) => (
              <div
                key={`${it.id}-${it.size}-${it.color || ""}`}
                className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
              >
                <div className="relative w-14 h-18 rounded-[4px] overflow-hidden shrink-0 bg-white border border-gray-200">
                  <Image
                    src={it.images?.[0]?.url || it.image || "/logo.png"}
                    alt={it.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-gray-900 line-clamp-1">{it.name}</p>
                  <p className="text-gray-500 mt-0.5">
                    Size: <span className="font-bold text-gray-800">{it.size}</span>
                    {it.color && (
                      <span> · Color: <span className="font-bold text-gray-800">{it.color}</span></span>
                    )}
                  </p>
                  <p className="text-gray-500">Qty: {it.qty || it.quantity || 1}</p>
                  <p className="font-extrabold text-gray-900 mt-1">
                    {formatPrice(it.price * (it.qty || it.quantity || 1))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-gray-200 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Item Subtotal</span>
              <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges</span>
              <span className={shippingFee === 0 ? "text-[#038a41] font-extrabold" : "font-bold text-gray-900"}>
                {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-3 border-t border-gray-200">
              <span>Grand Total</span>
              <span className="text-xl font-black text-[#3a1233] font-sans">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-[5px] bg-white border border-gray-200 text-[11px] text-gray-600 space-y-1 shadow-xs">
            <p className="flex items-center gap-1.5 text-[#038a41] font-bold">
              <ShieldCheck size={16} /> 100% Authentic Handpicked Quality
            </p>
            <p>Direct doorstep delivery from Tamil Nadu with 7-day easy returns.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

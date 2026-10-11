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
  Printer,
  FileText,
} from "@phosphor-icons/react";

import { submitOrderToBackend, getCmsSettings, sendOrderInvoice, normalizeImageUrl } from "@/lib/api";
import { useEffect } from "react";

const INDIAN_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Goa",
  "Haryana",
  "Punjab",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Himachal Pradesh",
  "Jharkhand",
  "Madhya Pradesh",
  "Odisha",
  "Uttarakhand",
  "Puducherry",
  "Chandigarh",
  "Jammu and Kashmir",
  "Ladakh",
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];

export default function CheckoutPage() {
  const { items, clear } = useCart(
    useShallow((s) => ({ items: s.items || [], clear: s.clear }))
  );

  // Active step: 1 = Address & Contact, 2 = Payment
  const [step, setStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [summaryOpenMobile, setSummaryOpenMobile] = useState(false);

  // Address & Contact form state
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    phoneCountryCode: "+91",
    email: "",
    pin: "",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    abroadRegion: "",
    line1: "",
    tag: "Home",
  });

  // Payment method: initially empty until user explicitly chooses online or cod
  // Delivery charge will NOT be added until online or cod is selected
  const [paymentMethod, setPaymentMethod] = useState("");

  // Dynamic Delivery settings from Admin CMS with Online and COD modes
  const [deliverySettings, setDeliverySettings] = useState({
    standardFee: 79,
    freeThreshold: 999,
    estimateDays: "3-5 Business Days",
    online: {
      firstItemFee: 79,
      additionalItemFee: 25,
      freeThreshold: 999,
      estimateDays: "3-5 Business Days",
      enabled: true,
    },
    cod: {
      firstItemFee: 99,
      additionalItemFee: 35,
      freeThreshold: 1499,
      estimateDays: "4-7 Business Days",
      enabled: true,
    },
  });

  useEffect(() => {
    getCmsSettings().then((res) => {
      if (res?.settings?.delivery_settings) {
        const d = res.settings.delivery_settings;
        const onlineEnabled = d.online?.enabled !== false;
        const codEnabled = d.cod?.enabled !== false;

        setDeliverySettings({
          standardFee: Number(d.standardFee ?? 79),
          freeThreshold: Number(d.freeThreshold ?? 999),
          estimateDays: d.estimateDays || "3-5 Business Days",
          online: {
            firstItemFee: Number(d.online?.firstItemFee ?? d.standardFee ?? 79),
            additionalItemFee: Number(d.online?.additionalItemFee ?? 25),
            freeThreshold: Number(d.online?.freeThreshold ?? d.freeThreshold ?? 999),
            estimateDays: d.online?.estimateDays || d.estimateDays || "3-5 Business Days",
            enabled: onlineEnabled,
          },
          cod: {
            firstItemFee: Number(d.cod?.firstItemFee ?? 99),
            additionalItemFee: Number(d.cod?.additionalItemFee ?? 35),
            freeThreshold: Number(d.cod?.freeThreshold ?? 1499),
            estimateDays: d.cod?.estimateDays || "4-7 Business Days",
            enabled: codEnabled,
          },
        });

        // Automatically align selected payment method if current one is disabled
        if (!onlineEnabled && paymentMethod === "online") {
          setPaymentMethod(codEnabled ? "cod" : "");
        } else if (!codEnabled && paymentMethod === "cod") {
          setPaymentMethod(onlineEnabled ? "online" : "");
        }
      }
    });
  }, [paymentMethod]);

  const totalUnits = items.reduce(
    (sum, item) => sum + (item.qty || item.quantity || 1),
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (item.qty || item.quantity || 1),
    0
  );

  // Dynamic delivery charge calculation based on Payment Mode (Online vs COD)
  // Delivery charge is ONLY calculated once the user chooses Online or COD
  const isCod = paymentMethod === "cod";
  const isOnline = paymentMethod === "online";
  const hasSelectedPayment = isCod || isOnline;
  const isAbroad = address.state === "Abroad / International";

  const activeDeliveryConfig = isCod ? deliverySettings.cod : deliverySettings.online;

  let shippingFee = 0;
  if (hasSelectedPayment && totalUnits > 0) {
    if (activeDeliveryConfig.freeThreshold > 0 && subtotal >= activeDeliveryConfig.freeThreshold) {
      shippingFee = 0;
    } else {
      const baseFee = activeDeliveryConfig.firstItemFee;
      const extraFee = Math.max(0, totalUnits - 1) * activeDeliveryConfig.additionalItemFee;
      shippingFee = baseFee + extraFee;
    }
  }

  const codFee = 0;
  const total = subtotal + (hasSelectedPayment ? shippingFee : 0);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    const isPhoneValid = address.phone.trim().length >= (isAbroad ? 6 : 10);
    const isPinValid = address.pin.trim().length >= (isAbroad ? 3 : 6);
    const isCountryValid = isAbroad ? Boolean(address.country?.trim()) : true;

    // Email is now optional - no required check for email
    if (
      address.name.trim() &&
      isPhoneValid &&
      isPinValid &&
      address.line1.trim() &&
      isCountryValid
    ) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      alert("Please select your payment method (Online Payment or Cash on Delivery) to proceed.");
      return;
    }

    const orderItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      price: i.price,
      mrp: i.mrp,
      size: i.size || "Free Size",
      color: i.color || "",
      qty: i.qty || i.quantity || 1,
      image: i.image || i.images?.[0]?.url || "/logo.png",
      customStitching: i.customStitching || null,
    }));

    const payload = {
      items: orderItems,
      shippingAddress: address,
      paymentMethod,
    };

    const backendRes = await submitOrderToBackend(payload);
    const serverOrder = backendRes?.order;
    const finalOrderNum =
      backendRes?.orderNumber ||
      serverOrder?.orderNumber ||
      "AGAL-" + Math.floor(100000 + Math.random() * 900000);

    const calculatedTotal = serverOrder?.totalAmount || serverOrder?.total_amount || total;

    const completedData = {
      orderNumber: finalOrderNum,
      items: orderItems,
      totalAmount: calculatedTotal,
      subtotal,
      shippingFee,
      address: { ...address },
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(`agal_order_${finalOrderNum}`, JSON.stringify(completedData));
    } catch (e) {}

    setCompletedOrder(completedData);
    setOrderNumber(finalOrderNum);
    setOrderComplete(true);
    clear();
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    if (selectedState === "Abroad / International") {
      setAddress((a) => ({
        ...a,
        state: selectedState,
        country: a.country === "India" ? "" : a.country,
        phoneCountryCode: a.phoneCountryCode === "+91" ? "" : a.phoneCountryCode,
      }));
      // Reset payment method if COD was selected because COD is domestic only
      if (paymentMethod === "cod") {
        setPaymentMethod("");
      }
    } else {
      setAddress((a) => ({
        ...a,
        state: selectedState,
        country: "India",
        phoneCountryCode: "+91",
      }));
    }
  };

  // Auto-fill city/state from PIN (for India)
  const handlePinChange = (e) => {
    if (isAbroad) {
      setAddress((a) => ({ ...a, pin: e.target.value }));
      return;
    }
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
    const displayAddr = completedOrder?.address || address;
    const displayItems = completedOrder?.items || [];
    const displayTotal = completedOrder?.totalAmount || total;

    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 text-center font-sans">
        <div className="w-20 h-20 rounded-full bg-green-50 text-[#238b45] grid place-items-center mx-auto mb-5 shadow-xs">
          <CheckCircle size={52} weight="fill" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-md mx-auto">
          Thank you, <strong className="text-gray-900">{displayAddr.name}</strong>! Your order has been registered and is being handcrafted for dispatch.
        </p>

        <div className="p-5 rounded-[5px] bg-[#fcfafc] border border-[#f3e3ee] text-left text-xs space-y-3 mb-6 shadow-xs">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-medium">Order Number:</span>
            <span className="font-mono font-extrabold text-plum text-sm">
              {orderNumber}
            </span>
          </div>

          {/* Ordered Products Items List */}
          <div className="py-2 border-b border-gray-200 space-y-2">
            <span className="text-gray-500 font-semibold block text-[11px] uppercase tracking-wider">
              Ordered Items ({displayItems.length}):
            </span>
            {displayItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-white p-2.5 rounded border border-gray-200">
                <div className="flex items-center gap-2.5">
                  <img src={item.image || "/logo.png"} alt={item.name} className="w-9 h-11 object-cover rounded bg-gray-50 shrink-0 border border-gray-200" />
                  <div>
                    <div className="font-bold text-gray-900 line-clamp-1">{item.name}</div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      Size: <span className="font-semibold text-gray-800">{item.size || "Free Size"}</span>
                      {item.color ? <span className="ml-1.5">• Color: <span className="font-semibold text-gray-800">{item.color}</span></span> : null}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-gray-900">{formatPrice(item.price * item.qty)}</div>
                  <div className="text-[10px] text-gray-400">Qty: {item.qty}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Recipient Name:</span>
            <span className="font-bold text-gray-900">{displayAddr.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Phone Number:</span>
            <span className="font-bold text-gray-900">
              {displayAddr.phoneCountryCode ? `${displayAddr.phoneCountryCode} ` : "+91 "}{displayAddr.phone}
            </span>
          </div>
          {displayAddr.email ? (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Email ID:</span>
              <span className="font-bold text-gray-900">{displayAddr.email}</span>
            </div>
          ) : null}
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium">Delivery Address:</span>
            <span className="font-bold text-gray-900 text-right max-w-[240px]">
              {displayAddr.line1}, {displayAddr.city}, {displayAddr.state}
              {displayAddr.country && displayAddr.country !== "India" ? `, ${displayAddr.country}` : ""}
              {displayAddr.abroadRegion ? ` (${displayAddr.abroadRegion})` : ""} - {displayAddr.pin} ({displayAddr.tag})
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-500 font-medium">Payment Method:</span>
            <span className="font-bold text-gray-900 uppercase">
              {(completedOrder?.paymentMethod || paymentMethod) === "online" ? "Online Payment (Paid)" : "Cash on Delivery (Pay on Arrival)"}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-bold text-sm">Total Amount:</span>
            <span className="font-extrabold text-lg text-[#3a1233]">
              {formatPrice(displayTotal)}
            </span>
          </div>
        </div>

        {/* Invoice & Phone Delivery Actions */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/invoice/${orderNumber}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 rounded-[5px] bg-plum text-white font-extrabold text-xs hover:bg-plum-900 transition-all shadow-xs"
            >
              <FileText size={18} weight="bold" />
              Download Tax Invoice (PDF)
            </Link>

            <button
              type="button"
              onClick={async () => {
                const customerPhone = displayAddr.phone || "";
                if (!customerPhone) {
                  alert("No phone number found.");
                  return;
                }
                try {
                  const res = await sendOrderInvoice(orderNumber, {
                    phone: customerPhone,
                    customerName: displayAddr.name,
                    totalAmount: displayTotal,
                    paymentMethod: completedOrder?.paymentMethod || paymentMethod,
                    items: displayItems,
                    shippingAddress: displayAddr,
                  });
                  if (res && res.whatsappUrl) {
                    window.open(res.whatsappUrl, "_blank");
                  } else {
                    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
                    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                    window.open(
                      `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(
                        `✨ Agal Boutique Tax Invoice for Order #${orderNumber} is available at: ${window.location.origin}/invoice/${orderNumber}`
                      )}`,
                      "_blank"
                    );
                  }
                } catch (e) {
                  alert("Failed to send invoice: " + e.message);
                }
              }}
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 rounded-[5px] bg-[#25D366] text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-xs cursor-pointer"
            >
              <WhatsappLogo size={18} weight="fill" />
              Send Invoice to Phone
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/919876543210?text=Hello%20Agal%20Boutique,%20I%20just%20placed%20order%20${orderNumber}%20under%20the%20name%20${encodeURIComponent(address.name)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-[5px] border border-gray-300 bg-white text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
            >
              <WhatsappLogo size={18} className="text-[#25D366]" weight="fill" />
              Track on WhatsApp
            </a>

            <Button href="/shop" variant="primary" className="flex-1 rounded-[5px]">
              Continue Shopping
            </Button>
          </div>
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
                {!hasSelectedPayment ? (
                  <span className="text-gray-500 font-semibold text-[11px]">
                    Select Online or COD
                  </span>
                ) : (
                  <span className={shippingFee === 0 ? "text-[#038a41] font-bold" : "font-bold"}>
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                )}
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
                      {isAbroad ? (
                        <input
                          type="text"
                          placeholder="+1 / +44"
                          value={address.phoneCountryCode || "+"}
                          onChange={(e) =>
                            setAddress({
                              ...address,
                              phoneCountryCode: e.target.value,
                            })
                          }
                          className="w-20 px-2.5 py-2.5 rounded-[5px] border border-gray-300 bg-gray-50 text-xs sm:text-sm text-gray-900 font-bold focus:outline-none focus:border-plum text-center"
                          title="Country Code"
                        />
                      ) : (
                        <span className="inline-flex items-center px-3 rounded-[5px] border border-gray-300 bg-gray-50 text-xs text-gray-700 font-bold">
                          +91
                        </span>
                      )}
                      <input
                        type="tel"
                        inputMode={isAbroad ? "text" : "numeric"}
                        maxLength={isAbroad ? 16 : 10}
                        placeholder={isAbroad ? "Phone / Mobile number" : "9876543210"}
                        value={address.phone}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            phone: isAbroad
                              ? e.target.value.replace(/[^\d\s-]/g, "")
                              : e.target.value.replace(/\D/g, ""),
                          })
                        }
                        required
                        className="flex-1 px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                      />
                    </div>
                  </div>
                </div>

                {/* Email ID (Optional) & PIN / Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Mail ID (Email) <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. priya@example.com (optional)"
                      value={address.email}
                      onChange={(e) =>
                        setAddress({ ...address, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {isAbroad ? "Postal / ZIP Code" : "PIN Code (6 digits)"} <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode={isAbroad ? "text" : "numeric"}
                      maxLength={isAbroad ? 12 : 6}
                      placeholder={isAbroad ? "e.g. 90210, SW1A 1AA" : "e.g. 600028"}
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

                {/* City & State (Dropdown with Indian states and Abroad option) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {isAbroad ? "City / Town" : "City / District"} <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      placeholder={isAbroad ? "e.g. Los Angeles, Dubai, London" : "e.g. Chennai"}
                      required
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      State / Region <span className="text-crimson">*</span>
                    </label>
                    <select
                      value={address.state}
                      onChange={handleStateChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum cursor-pointer"
                    >
                      <optgroup label="India (States & Union Territories)">
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="International / Outside India">
                        <option value="Abroad / International">
                          ✈️ Abroad / International (Other Countries)
                        </option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* International / Abroad Additional Fields */}
                {isAbroad && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-plum/5 rounded-[5px] border border-plum/20 animate-fade-in">
                    <div>
                      <label className="text-xs font-bold text-gray-800 block mb-1">
                        Country Name <span className="text-crimson">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. United States, Singapore, UAE, UK, Malaysia"
                        value={address.country === "India" ? "" : address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        required={isAbroad}
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-800 block mb-1">
                        Province / State / Emirate <span className="text-xs font-normal text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. California, Selangor, Dubai"
                        value={address.abroadRegion || ""}
                        onChange={(e) => setAddress({ ...address, abroadRegion: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-[5px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum"
                      />
                    </div>
                    <p className="sm:col-span-2 text-[11px] text-plum font-medium">
                      🌍 Worldwide shipping available! For international deliveries, our team will coordinate custom dispatch & tracking details with you via WhatsApp.
                    </p>
                  </div>
                )}

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
                  {address.name} · {address.phoneCountryCode ? `${address.phoneCountryCode} ` : "+91 "}{address.phone}
                </p>
                {address.email ? <p className="text-gray-600">Email: {address.email}</p> : null}
                <p className="text-gray-600">
                  {address.line1}, {address.city}, {address.state}
                  {address.country && address.country !== "India" ? `, ${address.country}` : ""}
                  {address.abroadRegion ? ` (${address.abroadRegion})` : ""} - {address.pin} ({address.tag})
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
                {!hasSelectedPayment && (
                  <div className="p-3 rounded-[5px] bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <span className="font-extrabold text-amber-800">⚡ Note:</span>
                    <span>Please select your payment option below to calculate your delivery charges.</span>
                  </div>
                )}

                {/* Option 1: Online Payment */}
                {deliverySettings.online?.enabled !== false && (
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
                          Pay securely with Google Pay, PhonePe, Paytm, Debit/Credit Card or Net Banking.
                          {deliverySettings.online.freeThreshold > 0 && (
                            <span className="block text-plum font-semibold mt-0.5">
                              ⚡ 1st item ₹{deliverySettings.online.firstItemFee} + ₹{deliverySettings.online.additionalItemFee}/extra item (FREE above ₹{deliverySettings.online.freeThreshold})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#038a41] bg-[#e6f4ea] px-2 py-0.5 rounded-[3px] shrink-0 ml-2">
                      {paymentMethod === "online" && shippingFee === 0 ? "FREE Delivery" : "Recommended"}
                    </span>
                  </label>
                )}

                {deliverySettings.online?.enabled === false && deliverySettings.cod?.enabled === false && (
                  <div className="p-4 rounded-[5px] bg-red-50 border border-red-200 text-xs text-red-800">
                    Online and COD payments are temporarily offline for boutique maintenance. Please contact store support.
                  </div>
                )}

                {/* Option 2: Cash on Delivery (COD) */}
                {deliverySettings.cod?.enabled !== false && (
                  <label
                    className={`flex items-start justify-between p-4 rounded-[5px] border transition-all ${
                      isAbroad
                        ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                        : paymentMethod === "cod"
                        ? "border-plum bg-plum/5 ring-1 ring-plum shadow-xs cursor-pointer"
                        : "border-gray-300 bg-white hover:border-gray-400 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        disabled={isAbroad}
                        checked={paymentMethod === "cod"}
                        onChange={() => !isAbroad && setPaymentMethod("cod")}
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
                          {isAbroad ? (
                            <span className="text-red-600 font-semibold">
                              Cash on delivery is not available for abroad / international shipping. Please choose Online Payment.
                            </span>
                          ) : (
                            <>
                              Pay in cash or UPI QR scan at your doorstep upon delivery.
                              <span className="block text-gray-700 font-semibold mt-0.5">
                                📦 1st item ₹{deliverySettings.cod.firstItemFee} + ₹{deliverySettings.cod.additionalItemFee}/extra item
                                {deliverySettings.cod.freeThreshold > 0 && ` (FREE above ₹${deliverySettings.cod.freeThreshold})`}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-[3px] shrink-0 ml-2 ${
                      isAbroad ? "text-gray-500 bg-gray-200" : "text-amber-800 bg-amber-100"
                    }`}>
                      {isAbroad ? "India Only" : (paymentMethod === "cod" && shippingFee === 0 ? "FREE COD" : "COD Available")}
                    </span>
                  </label>
                )}

                <div className="pt-3">
                  <Button
                    type="button"
                    onClick={handlePlaceOrder}
                    variant="action"
                    fullWidth
                    className={`h-12 rounded-[5px] text-sm font-extrabold shadow-sm cursor-pointer ${
                      !hasSelectedPayment ? "opacity-90" : ""
                    }`}
                  >
                    {!hasSelectedPayment
                      ? `Select Online or COD to Continue · ${formatPrice(subtotal)}`
                      : `Place Order · ${formatPrice(total)}`}
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
                    src={normalizeImageUrl(it.image || it.images?.[0])}
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
              {!hasSelectedPayment ? (
                <span className="text-gray-500 font-medium text-[11px] bg-gray-100 px-2 py-0.5 rounded">
                  Calculated at payment
                </span>
              ) : (
                <div className="text-right">
                  <span className={shippingFee === 0 ? "text-[#038a41] font-extrabold" : "font-bold text-gray-900"}>
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-normal">
                    ({paymentMethod === "online" ? "Online mode" : "COD mode"})
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-3 border-t border-gray-200">
              <div>
                <span>Grand Total</span>
                {!hasSelectedPayment && (
                  <span className="text-[10px] text-gray-400 block font-normal">
                    (Before delivery charges)
                  </span>
                )}
              </div>
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

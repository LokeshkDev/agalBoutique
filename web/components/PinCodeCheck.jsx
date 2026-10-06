"use client";

import { useState } from "react";
import { Truck, CheckCircle } from "@phosphor-icons/react";

export default function PinCodeCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(pin)) {
      setError("Please enter a valid 6-digit PIN code.");
      setResult(null);
      return;
    }

    // Realistic delivery estimate based on PIN prefix
    const isTN = pin.startsWith("60") || pin.startsWith("61") || pin.startsWith("62") || pin.startsWith("63") || pin.startsWith("64");
    const isMetro = ["11", "40", "56", "50", "70"].some((prefix) => pin.startsWith(prefix));

    if (isTN) {
      setResult({
        days: "2–3 business days",
        location: "Tamil Nadu",
        cod: true,
      });
    } else if (isMetro) {
      setResult({
        days: "3–4 business days",
        location: "Metro Cities",
        cod: true,
      });
    } else {
      setResult({
        days: "5–7 business days",
        location: "Rest of India",
        cod: true,
      });
    }
  };

  return (
    <div className="p-4 rounded-xl bg-blush/60 border border-line space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-plum-900 uppercase tracking-wider">
        <Truck size={18} weight="light" className="text-plum" />
        Delivery Options & Check PIN
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit PIN code"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          className="flex-1 px-3.5 py-2 text-xs rounded-full border border-line bg-ivory text-ink focus:outline-none focus:border-plum"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-plum text-ivory text-xs font-semibold hover:bg-plum-700 transition-colors cursor-pointer"
        >
          Check
        </button>
      </form>

      {error && <p className="text-xs text-crimson font-medium">{error}</p>}

      {result && (
        <div className="text-xs text-ink space-y-1 pt-1 border-t border-line/60">
          <p className="flex items-center gap-1.5 text-leaf font-semibold">
            <CheckCircle size={14} weight="fill" />
            Delivery in {result.days}
          </p>
          <p className="text-muted">
            Standard Delivery · Cash on Delivery available for {pin}
          </p>
        </div>
      )}
    </div>
  );
}


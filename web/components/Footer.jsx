"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-ivory border-t border-line text-ink pt-12 pb-16 lg:pb-12">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-line">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Agal Boutique"
                width={140}
                height={50}
                className="h-[48px] w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted font-sans max-w-sm leading-relaxed">
              Agal Boutique brings you handcrafted sarees, pure cotton kurtis, tailored lehengas, and bespoke blouse stitching straight from Tamil Nadu to your home across India.
            </p>
            <div className="text-xs text-muted space-y-1">
              <p>📍 Tamil Nadu, India</p>
              <p>⏱ Mon–Sat: 9:30 AM – 8:00 PM IST</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold font-sans uppercase tracking-wider text-plum-900 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/shop?category=sarees" className="hover:text-plum transition-colors">
                  Sarees
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kurtis" className="hover:text-plum transition-colors">
                  Kurtis
                </Link>
              </li>
              <li>
                <Link href="/shop?category=full-sets" className="hover:text-plum transition-colors">
                  Full Sets & Anarkalis
                </Link>
              </li>
              <li>
                <Link href="/shop?category=blouses" className="hover:text-plum transition-colors">
                  Blouses & Stitching
                </Link>
              </li>
              <li>
                <Link href="/shop?category=lehengas" className="hover:text-plum transition-colors">
                  Lehenga Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kidswear" className="hover:text-plum transition-colors">
                  Kidswear & Pattu Pavadai
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h4 className="text-sm font-semibold font-sans uppercase tracking-wider text-plum-900 mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/shop" className="hover:text-plum transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <span className="cursor-default">Delivery: 3–7 Business Days</span>
              </li>
              <li>
                <span className="cursor-default">7-Day Easy Returns</span>
              </li>
              <li>
                <span className="cursor-default">Cash on Delivery & UPI</span>
              </li>
              <li>
                <span className="cursor-default">Size & Blouse Guide</span>
              </li>
            </ul>
          </div>

          {/* Single Newsletter Field */}
          <div>
            <h4 className="text-sm font-semibold font-sans uppercase tracking-wider text-plum-900 mb-3">
              New Weave Alerts
            </h4>
            <p className="text-xs text-muted mb-3">
              Get notified when handloom drops and festive collections launch.
            </p>
            {subscribed ? (
              <p className="text-xs text-leaf font-semibold">
                ✓ Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-full border border-line bg-blush text-ink focus:outline-none focus:border-plum"
                />
                <button
                  type="submit"
                  className="w-full text-xs font-semibold py-2.5 rounded-full bg-plum text-ivory hover:bg-plum-700 transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Agal Boutique. All rights reserved. Handcrafted in India.</p>
          <div className="flex gap-4">
            <span className="text-ink font-medium">₹ INR</span>
            <span>Made with Care for Indian Shoppers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

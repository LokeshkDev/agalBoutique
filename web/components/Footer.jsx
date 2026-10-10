"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

export default function Footer() {
  // Mobile accordion open states
  const [openSections, setOpenSections] = useState({
    categories: false,
    care: false,
    links: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <footer className="bg-ivory border-t border-line text-ink pt-10 pb-16 lg:pb-10 font-sans">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Main Grid for Desktop / Accordion for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-10 pb-10 border-b border-line">
          {/* Brand Logo Only (No Description, No Location/Timing) */}
          <div className="flex items-center md:items-start justify-center md:justify-start pb-4 md:pb-0">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Agal Boutique"
                width={140}
                height={50}
                className="h-[48px] w-auto object-contain"
              />
            </Link>
          </div>

          {/* Categories Section (Accordion on Mobile, Grid Column on Desktop) */}
          <div className="border-b border-line md:border-b-0 pb-3 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("categories")}
              className="w-full flex items-center justify-between md:cursor-default py-1 md:py-0 text-left cursor-pointer"
            >
              <h4 className="text-sm font-bold uppercase tracking-wider text-plum-900">
                Categories
              </h4>
              <span className="md:hidden text-gray-500">
                {openSections.categories ? <CaretUp size={16} /> : <CaretDown size={16} />}
              </span>
            </button>

            <ul
              className={`space-y-2.5 text-xs sm:text-sm text-muted mt-3 ${
                openSections.categories ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <Link href="/shop?category=sarees" className="hover:text-plum transition-colors">
                  Sarees & Handlooms
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kurtis" className="hover:text-plum transition-colors">
                  Kurtis & Tunics
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

          {/* Customer Care Section (Accordion on Mobile) */}
          <div className="border-b border-line md:border-b-0 pb-3 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection("care")}
              className="w-full flex items-center justify-between md:cursor-default py-1 md:py-0 text-left cursor-pointer"
            >
              <h4 className="text-sm font-bold uppercase tracking-wider text-plum-900">
                Customer Care
              </h4>
              <span className="md:hidden text-gray-500">
                {openSections.care ? <CaretUp size={16} /> : <CaretDown size={16} />}
              </span>
            </button>

            <ul
              className={`space-y-2.5 text-xs sm:text-sm text-muted mt-3 ${
                openSections.care ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <Link href="/about" className="hover:text-plum transition-colors">
                  About Agal Boutique
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-plum transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-plum transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <span className="cursor-default">7-Day Easy Returns</span>
              </li>
              <li>
                <span className="cursor-default">Free COD & UPI Payments</span>
              </li>
            </ul>
          </div>

          {/* Quick Links Section (Accordion on Mobile) */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("links")}
              className="w-full flex items-center justify-between md:cursor-default py-1 md:py-0 text-left cursor-pointer"
            >
              <h4 className="text-sm font-bold uppercase tracking-wider text-plum-900">
                Quick Links
              </h4>
              <span className="md:hidden text-gray-500">
                {openSections.links ? <CaretUp size={16} /> : <CaretDown size={16} />}
              </span>
            </button>

            <ul
              className={`space-y-2.5 text-xs sm:text-sm text-muted mt-3 ${
                openSections.links ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <Link href="/" className="hover:text-plum transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-plum transition-colors">
                  Shop All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop?category=blouses" className="hover:text-plum transition-colors">
                  Custom Stitching
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-plum transition-colors">
                  Our Weaving Story
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Footer Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted text-center sm:text-left">
          <p>© {new Date().getFullYear()} Agal Boutique. All rights reserved. Handcrafted in India.</p>
          <div className="flex items-center gap-4 font-medium">
            <span className="text-ink">₹ INR</span>
            <span>Direct Weavers to Doorstep</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

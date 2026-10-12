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
    <footer className="bg-[#180e19] border-t border-white/10 text-[#f5eef4] pt-10 pb-24 lg:pb-10 font-sans">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Brand Logo & Plus Size Specialization Header */}
        <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-white/10">
          <Link
            href="/"
            className="inline-flex items-center justify-center p-2.5 px-5 rounded-2xl bg-white shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Image
              src="/logo.png"
              alt="Agal Boutique - Plus Size Ethnic Wear Specialist"
              width={160}
              height={52}
              className="h-[46px] w-auto object-contain"
            />
          </Link>

          <h3 className="text-sm sm:text-base font-extrabold text-white mt-3.5 tracking-wide">
            India&apos;s Premier Plus-Size Ethnic Wear Destination · Sizes 34 to 56 (XS to 6XL)
          </h3>
          <p className="text-xs sm:text-sm text-[#e6d3e1] mt-1.5 max-w-2xl font-medium leading-relaxed">
            Specialized in premium quality fabrics, 100+ varieties of sets, 2-piece &amp; 3-piece full sets, and tops with dupatta with easy availability and express delivery across India.
          </p>

          {/* Plus Size & Quality Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-3xl">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] sm:text-xs font-bold border border-white/20">
              ✦ Plus Size Specialist (Sizes 34–56)
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] sm:text-xs font-bold border border-white/20">
              ✦ Premium Quality Handloom &amp; Cambric Cotton
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] sm:text-xs font-bold border border-white/20">
              ✦ 100+ Unique Varieties
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] sm:text-xs font-bold border border-white/20">
              ✦ Full Sets &amp; Tops with Dupatta
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] sm:text-xs font-bold border border-white/20">
              ✦ Easy Availability &amp; Fast Dispatch
            </span>
          </div>
        </div>

        {/* Desktop 3-Column Grid / Mobile Interactive Accordion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-10 py-6 md:py-10 border-b border-white/10">
          {/* 1. Categories Section */}
          <div className="border-b border-white/10 md:border-b-0 py-3 md:py-0">
            <button
              type="button"
              onClick={() => toggleSection("categories")}
              className="w-full flex items-center justify-between md:cursor-default py-1 md:py-0 text-left cursor-pointer group"
              aria-expanded={openSections.categories}
            >
              <h4 className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-pink-200 transition-colors">
                Specialized Collections
              </h4>
              <span className="md:hidden text-pink-300 p-1">
                {openSections.categories ? <CaretUp size={18} weight="bold" /> : <CaretDown size={18} weight="bold" />}
              </span>
            </button>

            <ul
              className={`space-y-2.5 text-xs sm:text-sm text-[#d4c3ce] mt-3 ${
                openSections.categories ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <Link href="/shop?category=top-with-dupatta-2-piece-set" className="hover:text-white transition-colors block py-0.5">
                  Top with Dupatta 2-Piece Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=straight-cut-3-piece-set" className="hover:text-white transition-colors block py-0.5">
                  Straight Cut 3-Piece Full Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=anarkali-3-piece-set" className="hover:text-white transition-colors block py-0.5">
                  Anarkali 3-Piece Full Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=umbrella-top" className="hover:text-white transition-colors block py-0.5">
                  Umbrella Tops &amp; Kurtis
                </Link>
              </li>
              <li>
                <Link href="/shop?category=straight-cut-2-piece-set" className="hover:text-white transition-colors block py-0.5">
                  Straight Cut 2-Piece Sets
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors block py-0.5">
                  Plus-Size Special (Sizes 34–56)
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Customer Care Section */}
          <div className="border-b border-white/10 md:border-b-0 py-3 md:py-0">
            <button
              type="button"
              onClick={() => toggleSection("care")}
              className="w-full flex items-center justify-between md:cursor-default py-1 md:py-0 text-left cursor-pointer group"
              aria-expanded={openSections.care}
            >
              <h4 className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-pink-200 transition-colors">
                Customer Care &amp; Trust
              </h4>
              <span className="md:hidden text-pink-300 p-1">
                {openSections.care ? <CaretUp size={18} weight="bold" /> : <CaretDown size={18} weight="bold" />}
              </span>
            </button>

            <ul
              className={`space-y-2.5 text-xs sm:text-sm text-[#d4c3ce] mt-3 ${
                openSections.care ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <Link href="/about" className="hover:text-white transition-colors block py-0.5">
                  About Agal Boutique
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors block py-0.5">
                  Contact &amp; WhatsApp Support
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors block py-0.5">
                  Track Order Status
                </Link>
              </li>
              <li className="text-[#a895a2] py-0.5">
                ✦ Easy Availability &amp; Ready Stock
              </li>
              <li className="text-[#a895a2] py-0.5">
                ✦ 7-Day Easy Returns &amp; Size Exchanges
              </li>
              <li className="text-[#a895a2] py-0.5">
                ✦ Cash on Delivery &amp; All UPI Apps Accepted
              </li>
            </ul>
          </div>

          {/* 3. Quick Links Section */}
          <div className="py-3 md:py-0">
            <button
              type="button"
              onClick={() => toggleSection("links")}
              className="w-full flex items-center justify-between md:cursor-default py-1 md:py-0 text-left cursor-pointer group"
              aria-expanded={openSections.links}
            >
              <h4 className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-pink-200 transition-colors">
                Explore 100+ Varieties
              </h4>
              <span className="md:hidden text-pink-300 p-1">
                {openSections.links ? <CaretUp size={18} weight="bold" /> : <CaretDown size={18} weight="bold" />}
              </span>
            </button>

            <ul
              className={`space-y-2.5 text-xs sm:text-sm text-[#d4c3ce] mt-3 ${
                openSections.links ? "block" : "hidden md:block"
              }`}
            >
              <li>
                <Link href="/" className="hover:text-white transition-colors block py-0.5">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors block py-0.5">
                  Shop All 100+ Varieties
                </Link>
              </li>
              <li>
                <Link href="/shop?isNew=true" className="hover:text-white transition-colors block py-0.5">
                  Fresh Arrivals &amp; New Weaves
                </Link>
              </li>
              <li>
                <Link href="/shop?isBestseller=true" className="hover:text-white transition-colors block py-0.5">
                  Most Loved Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors block py-0.5">
                  Our Handloom Heritage
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Trust Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#b8a6b2] text-center sm:text-left">
          <p>© {new Date().getFullYear()} Agal Boutique. Specialized in Plus Size Ethnic Wear, Full Sets &amp; Tops with Dupatta. Made with love in India.</p>
          <div className="flex items-center gap-4 font-semibold text-white">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] border border-white/20">₹ INR</span>
            <span className="text-[#e6d3e1]">Direct Weavers to Doorstep</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

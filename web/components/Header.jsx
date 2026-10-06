"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { MagnifyingGlass, Handbag, Scissors, Truck } from "@phosphor-icons/react";
import { useCart } from "@/store/cart";
import { useShallow } from "zustand/react/shallow";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");

  const { items = [], openCart } = useCart(
    useShallow((state) => ({
      items: state.items,
      openCart: state.openCart,
    }))
  );

  const totalItems = items.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/shop");
    }
  };

  const categorySubMenu = [
    { name: "Popular", href: "/shop" },
    { name: "Kurti, Saree & Lehenga", href: "/shop?category=sarees" },
    { name: "Kurtis & Tunics", href: "/shop?category=kurtis" },
    { name: "Full Sets & Anarkalis", href: "/shop?category=full-sets" },
    { name: "Blouses & Stitching", href: "/shop?category=blouses" },
    { name: "Lehenga Sets", href: "/shop?category=lehengas" },
    { name: "Kids & Pattu Pavadai", href: "/shop?category=kidswear" },
    { name: "Festive Offers", href: "/shop?sort=discount" },
  ];

  return (
    <header role="banner" className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Main Header (Meesho Style) */}
      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="Agal Boutique"
            width={130}
            height={44}
            className="h-9 sm:h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* Center: Search Bar with Placeholder matching Meesho */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl relative flex items-center"
        >
          <div className="relative w-full flex items-center">
            <MagnifyingGlass
              size={18}
              className="absolute left-3.5 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Try Saree, Kurti or Search by Product Code"
              className="w-full h-10 sm:h-11 pl-10 pr-4 rounded-[4px] border border-gray-300 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum transition-all font-sans"
            />
          </div>
        </form>

        {/* Right Action Links (Meesho Layout) */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          {/* Custom Stitching Link */}
          <Link
            href="/shop?category=blouses"
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-plum transition-colors"
          >
            <Scissors size={18} className="text-plum" />
            <span>Custom Stitching</span>
          </Link>

          {/* Track Order */}
          <Link
            href="/checkout"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-plum transition-colors border-r border-gray-300 pr-4"
          >
            <Truck size={18} className="text-gray-500" />
            <span>Track Order</span>
          </Link>

          {/* Cart Icon with Label & Badge */}
          <button
            type="button"
            aria-label="Shopping Cart"
            onClick={() => useCart.getState().openCart()}
            className="relative flex flex-col items-center justify-center text-gray-700 hover:text-plum transition-colors group cursor-pointer"
          >
            <div className="relative">
              <Handbag size={22} weight="regular" className="group-hover:text-plum" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-crimson rounded-full shadow-xs">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-[11px] font-semibold mt-0.5 font-sans">Cart</span>
          </button>
        </div>
      </div>

      {/* Bottom Sub-Category Navigation Bar (Meesho Style) */}
      <nav
        aria-label="Category Navigation"
        className="w-full border-t border-gray-200 bg-white"
      >
        <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar py-2.5 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
            {categorySubMenu.map((item) => {
              const isActive = pathname + (typeof window !== "undefined" ? window.location.search : "") === item.href;
              return (
                <li key={item.name} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`transition-colors hover:text-plum ${
                      isActive ? "text-plum font-bold" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}

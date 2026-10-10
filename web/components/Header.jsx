"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { MagnifyingGlass, Handbag, Truck, Info, Phone, List, X, CaretRight } from "@phosphor-icons/react";
import { useCart } from "@/store/cart";
import { useShallow } from "zustand/react/shallow";
import { getCmsSettings } from "@/lib/api";
import Sheet from "@/components/Sheet";
import AnnouncementBar from "@/components/AnnouncementBar";

const DEFAULT_MENU_ITEMS = [
  { title: "Popular", url: "/shop" },
  { title: "Sarees & Handlooms", url: "/shop?category=sarees" },
  { title: "Kurtis & Tunics", url: "/shop?category=kurtis" },
  { title: "Full Sets & Anarkalis", url: "/shop?category=full-sets" },
  { title: "Blouses & Stitching", url: "/shop?category=blouses" },
  { title: "Lehenga Sets", url: "/shop?category=lehengas" },
  { title: "Kidswear & Pattu Pavadai", url: "/shop?category=kidswear" },
  { title: "About Us", url: "/about" },
  { title: "Contact Us", url: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [searchParamsStr, setSearchParamsStr] = useState("");
  const [navMenuItems, setNavMenuItems] = useState(DEFAULT_MENU_ITEMS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    setSearchParamsStr(window.location.search || "");
  }, [pathname]);

  useEffect(() => {
    getCmsSettings().then((res) => {
      if (res?.settings?.header_nav_menu && Array.isArray(res.settings.header_nav_menu) && res.settings.header_nav_menu.length > 0) {
        setNavMenuItems(res.settings.header_nav_menu);
      }
    });
  }, []);

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
      setMobileSearchOpen(false);
    } else {
      router.push("/shop");
    }
  };

  return (
    <header role="banner" className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
      <AnnouncementBar />
      {/* Top Header Bar */}
      <div className="max-w-[var(--container)] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6 relative">
        {/* Mobile Left: Hamburger Menu Button */}
        <div className="flex sm:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="p-2 text-gray-700 hover:text-plum rounded-lg active:bg-gray-100 cursor-pointer"
          >
            <List size={24} weight="bold" />
          </button>
        </div>

        {/* Brand Logo (Centered on mobile, left-aligned on desktop) */}
        <div className="flex-1 sm:flex-initial flex justify-center sm:justify-start">
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
        </div>

        {/* Center: Desktop Inline Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-xl relative items-center"
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

        {/* Right Action Items */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Search Products"
            className="sm:hidden p-2 text-gray-700 hover:text-plum rounded-lg active:bg-gray-100 cursor-pointer"
          >
            <MagnifyingGlass size={22} weight="bold" />
          </button>

          {/* Desktop About Link */}
          <Link
            href="/about"
            className={`hidden sm:flex items-center gap-1 text-xs font-bold transition-colors ${
              pathname === "/about" ? "text-plum font-extrabold" : "text-gray-700 hover:text-plum"
            }`}
          >
            <Info size={18} className="text-plum" />
            <span>About Us</span>
          </Link>

          {/* Desktop Contact Link */}
          <Link
            href="/contact"
            className={`hidden sm:flex items-center gap-1 text-xs font-bold transition-colors border-r border-gray-300 pr-3 ${
              pathname === "/contact" ? "text-plum font-extrabold" : "text-gray-700 hover:text-plum"
            }`}
          >
            <Phone size={18} className="text-plum" />
            <span>Contact</span>
          </Link>

          {/* Desktop Track Order */}
          <Link
            href="/checkout"
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-plum transition-colors border-r border-gray-300 pr-3"
          >
            <Truck size={18} className="text-gray-500" />
            <span>Track Order</span>
          </Link>

          {/* Cart Icon with Badge */}
          <button
            type="button"
            aria-label="Shopping Cart"
            onClick={() => useCart.getState().openCart()}
            className="relative p-2 sm:p-0 flex flex-col items-center justify-center text-gray-700 hover:text-plum transition-colors group cursor-pointer"
          >
            <div className="relative">
              <Handbag size={22} weight="bold" className="group-hover:text-plum text-gray-800" />
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

      {/* Mobile Search Overlay Popover */}
      {mobileSearchOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white p-3 shadow-md animate-fade-in">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Sarees, Kurtis, Blouses..."
                className="w-full h-10 pl-9 pr-3 text-xs border border-gray-300 rounded-[5px] focus:outline-none focus:border-plum font-sans"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-plum text-white text-xs font-bold rounded-[5px] cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Desktop Sub-Category Navigation Bar (Dynamic CMS Links) */}
      <nav
        aria-label="Category Navigation"
        className="hidden sm:block w-full border-t border-gray-200 bg-white"
      >
        <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar py-2.5 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
            {navMenuItems.map((item, idx) => {
              const itemHref = item.url || item.href || "/shop";
              const isActive = pathname + searchParamsStr === itemHref;
              return (
                <li key={idx} className="shrink-0">
                  <Link
                    href={itemHref}
                    className={`transition-colors hover:text-plum ${
                      isActive ? "text-plum font-bold border-b-2 border-plum pb-1" : "text-gray-700"
                    }`}
                  >
                    {item.title || item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu (Slide-out from Left) */}
      <Sheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menu & Collections"
      >
        <div className="p-4 space-y-6">
          {/* Main Links (About Us & Contact Us) */}
          <div className="space-y-2 pb-4 border-b border-gray-200">
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-plum/5 text-plum font-bold text-sm"
            >
              <div className="flex items-center gap-2">
                <Info size={18} />
                <span>About Agal Boutique</span>
              </div>
              <CaretRight size={16} />
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm"
            >
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>Contact & Store Details</span>
              </div>
              <CaretRight size={16} />
            </Link>
          </div>

          {/* CMS Categories & Nav Menu */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 px-1">
              Explore Collections
            </h4>
            <div className="divide-y divide-gray-100">
              {navMenuItems.map((item, idx) => {
                const itemHref = item.url || item.href || "/shop";
                return (
                  <Link
                    key={idx}
                    href={itemHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-1 text-sm font-semibold text-gray-800 hover:text-plum"
                  >
                    <span>{item.title || item.name}</span>
                    <CaretRight size={14} className="text-gray-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </Sheet>
    </header>
  );
}

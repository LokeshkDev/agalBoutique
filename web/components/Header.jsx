"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  MagnifyingGlass,
  Handbag,
  Truck,
  Info,
  Phone,
  List,
  X,
  CaretRight,
  CaretDown,
  Sparkle,
} from "@phosphor-icons/react";
import { useCart } from "@/store/cart";
import { useShallow } from "zustand/react/shallow";
import { getCmsSettings, getCategories } from "@/lib/api";
import { categories as defaultCategories } from "@/lib/data/categories";
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
  const [categoriesList, setCategoriesList] = useState(defaultCategories);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setSearchParamsStr(window.location.search || "");
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // 1. Fetch CMS navigation menu
    getCmsSettings().then((res) => {
      if (
        res?.settings?.header_nav_menu &&
        Array.isArray(res.settings.header_nav_menu) &&
        res.settings.header_nav_menu.length > 0
      ) {
        setNavMenuItems(res.settings.header_nav_menu);
      }
    });

    // 2. Fetch Categories with Sub-categories
    getCategories().then((res) => {
      if (res?.success && Array.isArray(res.categories) && res.categories.length > 0) {
        setCategoriesList(res.categories);
      }
    });
  }, []);

  const { items = [] } = useCart(
    useShallow((state) => ({
      items: state.items,
    }))
  );

  const totalItems = items.reduce(
    (acc, item) => acc + (item.qty || item.quantity || 1),
    0
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
    } else {
      router.push("/shop");
    }
  };

  return (
    <header role="banner" className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
      {/* Announcement Marquee Bar (Hides smoothly on scroll) */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-12 opacity-100"
        }`}
      >
        <AnnouncementBar />
      </div>

      {/* Top Header Bar */}
      <div className="max-w-[var(--container)] mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 lg:h-22 flex items-center justify-between gap-3 relative transition-all duration-200">
        {/* Left Side: Hamburger Menu Button (+ Desktop Brand Logo on lg+ screens) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 z-20">
          {/* Hamburger Menu (Available on both Desktop & Mobile) */}
          <button
            type="button"
            onClick={() => setMenuDrawerOpen(true)}
            aria-label="Open Category & Collections Menu"
            className="p-2 -ml-1 text-gray-800 hover:text-plum rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Browse Categories & Sub-Categories"
          >
            <List size={26} weight="bold" />
            <span className="hidden md:inline text-xs font-bold text-gray-700">Categories</span>
          </button>

          {/* Desktop Brand Logo (Left aligned next to menu button on lg+ screens, increased size to fit header) */}
          <Link href="/" className="hidden lg:flex items-center shrink-0 py-1" title="Agal Boutique Home">
            <Image
              src="/logo.png"
              alt="Agal Boutique"
              width={320}
              height={100}
              className="h-16 xl:h-18 w-auto object-contain hover:opacity-95 transition-opacity"
              priority
            />
          </Link>
        </div>

        {/* Mobile/Tablet Centered Brand Logo (Exactly centered on screens < lg, increased size to fit header) */}
        <Link
          href="/"
          className="lg:hidden absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0 z-10 py-1"
          title="Agal Boutique Home"
        >
          <Image
            src="/logo.png"
            alt="Agal Boutique"
            width={260}
            height={80}
            className="h-13 sm:h-15 w-auto object-contain hover:opacity-95 transition-opacity"
            priority
          />
        </Link>

        {/* Desktop Quick Nav Links (Centered) */}
        <div className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-gray-600">
          <Link href="/shop" className="hover:text-plum transition-colors font-bold text-gray-900">
            All Collections
          </Link>
          <Link href="/shop?category=sarees" className="hover:text-plum transition-colors">
            Sarees
          </Link>
          <Link href="/shop?category=kurtis" className="hover:text-plum transition-colors">
            Kurtis
          </Link>
          <Link href="/shop?category=full-sets" className="hover:text-plum transition-colors">
            Full Sets
          </Link>
          <Link href="/about" className="hover:text-plum transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-plum transition-colors">
            Contact
          </Link>
        </div>

        {/* Right Side: Search Icon Button (BEFORE the Bag) + Bag/Cart Icon */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 z-20">
          {/* Search Icon Button (Placed before the bag on Desktop & Mobile) */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search Products"
            className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              searchOpen
                ? "bg-plum/10 text-plum font-bold"
                : "text-gray-700 hover:text-plum hover:bg-gray-100"
            }`}
            title="Search Products"
          >
            <MagnifyingGlass size={22} weight="bold" />
            <span className="hidden md:inline text-xs font-semibold">Search</span>
          </button>

          {/* Shopping Bag Icon with Crimson Badge */}
          <button
            type="button"
            aria-label="Shopping Cart"
            onClick={() => useCart.getState().openCart()}
            className="relative p-2 flex items-center gap-1.5 text-gray-800 hover:text-plum transition-colors group cursor-pointer rounded-lg hover:bg-gray-100"
            title="View Shopping Bag"
          >
            <div className="relative">
              <Handbag size={22} weight="bold" className="group-hover:text-plum text-gray-800" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-crimson rounded-full shadow-xs">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-xs font-semibold font-sans">Bag</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar (Desktop & Mobile) */}
      {searchOpen && (
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm p-3 sm:py-3.5 sm:px-6 shadow-md animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-3.5 top-3 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Sarees, Kurtis, Blouses, Anarkalis or style code..."
                  className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum font-sans bg-gray-50/50"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 bg-plum text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-plum-900 transition-colors cursor-pointer shadow-xs"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                title="Close search"
              >
                <X size={20} />
              </button>
            </form>
          </div>
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

      {/* Slide-out Hamburger Drawer: Categories & Sub-Categories */}
      <Sheet
        open={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        title="Collections & Categories"
        side="left"
      >
        <div className="p-4 space-y-6">
          {/* Category List with Sub-Categories Accordion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-plum">
                Categories & Sub-Categories
              </h4>
              <Link
                href="/shop"
                onClick={() => setMenuDrawerOpen(false)}
                className="text-[11px] font-bold text-gray-500 hover:text-plum"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="divide-y divide-gray-100 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              {categoriesList.map((cat, idx) => {
                let subcats = [];
                try {
                  subcats =
                    typeof cat.subcategories === "string"
                      ? JSON.parse(cat.subcategories)
                      : cat.subcategories || [];
                } catch (e) {
                  subcats = [];
                }
                if (!Array.isArray(subcats)) subcats = [];

                const isExpanded = expandedCategory === cat.slug;

                return (
                  <div key={cat.id || cat.slug || idx} className="transition-colors">
                    {/* Category Item Row */}
                    <div className="flex items-center justify-between p-3.5 hover:bg-gray-50">
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setMenuDrawerOpen(false)}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-plum/10 text-plum font-bold rounded-lg flex items-center justify-center shrink-0 text-sm">
                            {cat.name?.[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900 hover:text-plum transition-colors truncate">
                            {cat.name}
                          </div>
                          {subcats.length > 0 && (
                            <div className="text-[11px] text-gray-400 font-medium">
                              {subcats.length} sub-categories
                            </div>
                          )}
                        </div>
                      </Link>

                      {subcats.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedCategory(isExpanded ? null : cat.slug)}
                          className="p-1.5 text-gray-400 hover:text-plum hover:bg-plum/5 rounded-md transition-colors cursor-pointer shrink-0 ml-2"
                          aria-label={`Toggle ${cat.name} subcategories`}
                        >
                          <CaretDown
                            size={18}
                            weight="bold"
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-plum" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub-Categories Accordion List */}
                    {isExpanded && subcats.length > 0 && (
                      <div className="bg-plum/5 px-4 py-2 border-t border-gray-100 space-y-1 animate-fade-in">
                        {subcats.map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            href={`/shop?category=${cat.slug}&subcategory=${encodeURIComponent(sub)}`}
                            onClick={() => setMenuDrawerOpen(false)}
                            className="flex items-center justify-between py-2 px-2.5 text-xs font-semibold text-gray-700 hover:text-plum hover:bg-white rounded-md transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-plum/60" />
                              <span>{sub}</span>
                            </span>
                            <CaretRight size={12} className="text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Boutique Services Links */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 px-1">
              Boutique Services
            </h4>
            <Link
              href="/about"
              onClick={() => setMenuDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-plum/5 text-plum font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <Info size={16} />
                <span>About Agal Boutique</span>
              </div>
              <CaretRight size={14} />
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>Contact & Store Details</span>
              </div>
              <CaretRight size={14} />
            </Link>

            <Link
              href="/checkout"
              onClick={() => setMenuDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-gray-700 font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <Truck size={16} />
                <span>Track Order & Delivery Status</span>
              </div>
              <CaretRight size={14} />
            </Link>
          </div>
        </div>
      </Sheet>
    </header>
  );
}

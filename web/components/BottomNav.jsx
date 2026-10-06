"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, SquaresFour, Handbag, Heart } from "@phosphor-icons/react";
import { useCart } from "@/store/cart";
import { useShallow } from "zustand/react/shallow";

export default function BottomNav() {
  const pathname = usePathname();
  const { items = [], openCart } = useCart(
    useShallow((state) => ({
      items: state.items,
      openCart: state.openCart,
    }))
  );

  // Hide BottomNav on PDP so the mobile sticky Add to Bag / Buy Now bar sits cleanly at bottom-0
  if (pathname?.startsWith("/product/")) return null;

  const totalItems = items.reduce(
    (acc, item) => acc + (item.qty || item.quantity || 1),
    0
  );

  const tabs = [
    { name: "Home", href: "/", Icon: House },
    { name: "Shop", href: "/shop", Icon: SquaresFour },
    { name: "Cart", onClick: openCart, Icon: Handbag, badge: totalItems },
    { name: "Wishlist", href: "/wishlist", Icon: Heart },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 w-full z-50 h-[60px] bg-white border-t border-gray-200 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
    >
      <div className="flex h-full w-full justify-around items-center">
        {tabs.map((tab) => {
          const isActive = tab.href ? pathname === tab.href : false;
          const { Icon } = tab;

          if (tab.onClick) {
            return (
              <button
                key={tab.name}
                type="button"
                onClick={tab.onClick}
                className="relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] h-full flex-1 gap-1 cursor-pointer text-gray-700 hover:text-plum active:scale-95 transition-transform"
              >
                <div className="relative">
                  <Icon size={22} weight="regular" />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-extrabold text-white bg-crimson rounded-full shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold leading-none font-sans">
                  {tab.name}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] h-full flex-1 gap-1 ${
                isActive ? "text-plum font-bold" : "text-gray-600 font-medium"
              }`}
            >
              <Icon
                size={22}
                weight={isActive ? "fill" : "regular"}
                className={isActive ? "text-plum" : "currentColor"}
              />
              <span className="text-[11px] leading-none font-sans">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

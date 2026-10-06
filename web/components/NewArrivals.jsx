import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getNewArrivals } from "@/lib/data/products";

export default function NewArrivals() {
  const products = getNewArrivals();

  return (
    <section aria-labelledby="new-arrivals-heading" className="py-8 lg:py-14 bg-[#fbf5f7]">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2
              id="new-arrivals-heading"
              className="text-xl sm:text-2xl font-bold text-gray-900"
            >
              Fresh Arrivals & New Weaves
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-sans">
              Latest festival edits & bespoke styles added this week
            </p>
          </div>
          <Link
            href="/shop?sort=newest"
            className="text-xs sm:text-sm font-bold text-plum hover:underline"
          >
            View all ({products.length}) →
          </Link>
        </div>

        {/* Product Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {products.slice(0, 8).map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={idx < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

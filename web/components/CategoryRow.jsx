import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/api";

export default function CategoryRow() {
  const categories = getCategories();

  return (
    <section aria-labelledby="categories-heading" className="py-6 lg:py-10 bg-white">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2
              id="categories-heading"
              className="text-xl sm:text-2xl font-extrabold text-gray-900"
            >
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Explore curated boutique collections & handpicked styles
            </p>
          </div>

          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-plum hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* Categories Row: Replicating the Arched Pastel Dome Design from the Reference */}
        <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 justify-start lg:justify-between items-start">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="flex-shrink-0 w-24 sm:w-28 lg:w-36 snap-start group text-center flex flex-col items-center cursor-pointer"
            >
              {/* Arched Pastel Dome Frame */}
              <div className="relative w-full aspect-[4/5] rounded-t-[999px] rounded-b-[16px] bg-[#f7eaf2] overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 639px) 96px, (max-width: 1023px) 112px, 144px"
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Clean Centered Category Label */}
              <span className="mt-3 text-sm sm:text-base font-bold text-gray-900 group-hover:text-plum transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

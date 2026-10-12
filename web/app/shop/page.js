import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import { getProducts, getCategories } from "@/lib/api";
import { Tote } from "@phosphor-icons/react/dist/ssr";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const title = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")} | Plus Size Sets & Tops with Dupatta | Agal Boutique`
    : "Plus Size Sets, Tops with Dupatta & Full Sets (Sizes 34-56) | Agal Boutique";
  const description =
    "Shop 100+ varieties of premium quality plus-size ethnic wear, 2-piece & 3-piece full sets, straight cut sets, and tops with dupatta in sizes 34 to 56 with easy availability and cash on delivery.";

  const canonicalUrl = category ? `/shop?category=${encodeURIComponent(category)}` : "/shop";

  return {
    title,
    description,
    keywords: [
      "plus size ethnic wear",
      "plus size full sets",
      "tops with dupatta",
      "top with dupatta 2 piece set",
      "3 piece full sets",
      "100+ varieties plus size",
      "sizes 34 to 56",
      "premium quality plus size boutique",
      "easy availability",
      "Agal Boutique",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: `https://www.agalboutique.com${canonicalUrl}`,
    },
  };
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const subcategory = params?.subcategory || "";
  const search = params?.search || "";
  const sort = params?.sort || "newest";
  const fabric = params?.fabric || "";
  const size = params?.size || "";
  const page = parseInt(params?.page || "1", 10);
  const limit = 16;

  const isNew = params?.isNew !== undefined ? params.isNew : (params?.badge === "new" ? true : undefined);
  const isBestseller = params?.isBestseller !== undefined ? params.isBestseller : (params?.badge === "bestseller" ? true : undefined);

  // Parallel concurrent data fetching to eliminate sequential waterfalls
  const [catRes, prodRes] = await Promise.all([
    getCategories(),
    getProducts({
      category,
      subcategory,
      search,
      sort,
      fabric,
      size,
      isNew,
      isBestseller,
      page,
      limit,
    }),
  ]);

  const categoriesList = catRes?.categories || [];
  const productsList = prodRes?.products || [];
  const total = prodRes?.total || productsList.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const categoryName = category
    ? categoriesList.find(
        (c) =>
          c.slug?.toLowerCase() === category.toLowerCase() ||
          c.name?.toLowerCase() === category.toLowerCase()
      )?.name || category
    : "All Collections";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} - Agal Boutique`,
    numberOfItems: total,
    itemListElement: productsList.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.images?.[0]?.url || "/logo.png",
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "INR",
        },
      },
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />

      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-4 lg:py-6 animate-section-reveal">
        {/* Compact Header with Title & Filter Controls Component */}
        <ShopFilters categoryName={categoryName} totalCount={total} categories={categoriesList} />

        {/* Product Grid or Empty State */}
        {productsList.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 grid place-items-center mb-4 text-plum">
              <Tote size={36} weight="light" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              No matching products found
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm">
              Try adding products from the Admin Control Panel or adjusting your selected filters.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-10 px-6 rounded-[5px] bg-plum text-white text-xs font-bold hover:bg-plum-700 transition-colors"
            >
              Clear All Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5 mt-4">
            {productsList.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
              />
            ))}
          </div>
        )}

        {/* Pagination / Load More */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/shop?${new URLSearchParams({ ...params, page: page - 1 }).toString()}`}
                className="px-4 py-2 rounded-[5px] border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:border-plum"
              >
                ← Previous
              </Link>
            )}
            <span className="text-xs text-gray-500 font-bold px-3">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/shop?${new URLSearchParams({ ...params, page: page + 1 }).toString()}`}
                rel="next"
                className="px-4 py-2 rounded-[5px] border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:border-plum"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

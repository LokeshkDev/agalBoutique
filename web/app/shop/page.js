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
    ? `${category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")} Collection | Agal Boutique`
    : "Shop Handpicked Sarees, Kurtis & Blouses | Agal Boutique";
  const description =
    "Explore our full catalogue of authentic South Indian handloom sarees, cambric cotton kurtis, party lehengas, and custom-stitched blouses.";

  return {
    title,
    description,
    alternates: {
      canonical: "/shop",
    },
    openGraph: {
      title,
      description,
      url: "https://www.agalboutique.com/shop",
    },
  };
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const sort = params?.sort || "newest";
  const size = params?.size ? [params.size] : [];
  const fabric = params?.fabric ? [params.fabric] : [];
  const occasion = params?.occasion ? [params.occasion] : [];
  const page = parseInt(params?.page || "1", 10);

  const categories = getCategories();
  const { products, total, totalPages } = getProducts({
    category,
    sort,
    sizes: size,
    fabrics: fabric,
    occasions: occasion,
    page,
    limit: 16,
  });

  const categoryName = category
    ? categories.find((c) => c.slug === category)?.name || category
    : "All Collections";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} - Agal Boutique`,
    numberOfItems: total,
    itemListElement: products.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.images[0]?.url,
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "INR",
        },
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.agalboutique.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: "https://www.agalboutique.com/shop",
      },
    ],
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Header with Title & Item Count */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {categoryName}
            </h1>
            <span className="text-xs sm:text-sm text-gray-500 font-bold">
              ({total} {total === 1 ? "Product" : "Products"})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Authentic weaves and tailored fits with custom blouse stitching available on request.
          </p>
        </div>

        {/* Filter Controls Component */}
        <ShopFilters totalCount={total} categories={categories} />

        {/* Product Grid or Empty State */}
        {products.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 grid place-items-center mb-4 text-plum">
              <Tote size={36} weight="light" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              No matching products found
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm">
              Try adjusting your selected filters or explore our full catalogue.
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
            {products.map((product, idx) => (
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

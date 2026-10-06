import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";
import Accordion from "@/components/Accordion";
import PinCodeCheck from "@/components/PinCodeCheck";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getProduct, getSimilarProducts } from "@/lib/api";
import { formatPrice, discountPercent } from "@/lib/format";
import { Star, Tag, ShieldCheck, Truck, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Agal Boutique",
    };
  }

  const title = `${product.name} | Agal Boutique`;
  const description = `${product.description.slice(0, 145)} ₹${product.price}. Free delivery above ₹999.`;
  const imageUrl = product.images?.[0]?.url || "/logo.png";

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://www.agalboutique.com/product/${product.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1600,
          alt: product.images?.[0]?.alt || product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const similarProducts = getSimilarProducts(product.id, 4);
  const discount = discountPercent(product.price, product.mrp);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: "Agal Boutique" },
    image: product.images?.map((i) => i.url),
    material: product.fabric,
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `https://www.agalboutique.com/product/${product.slug}`,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <JsonLd data={productLd} />

      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-4 lg:py-8 pb-32 lg:pb-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="text-xs text-gray-500 mb-4 font-medium">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-plum transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/shop?category=${product.category.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-plum transition-colors"
              >
                {product.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-bold truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* PDP Layout: Gallery Left, Sticky Details Right on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Gallery Column */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Details Column (Meesho / Myntra Style) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
            {/* Title & Category */}
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-plum">
                {product.category} · {product.fabric}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mt-0.5">
                {product.name}
              </h1>
            </div>

            {/* Price Box - Meesho / Myntra Large Format */}
            <div className="p-3.5 rounded-[5px] bg-[#fcfafc] border border-[#f3e3ee] space-y-2">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
                  {formatPrice(product.price)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-sm sm:text-base text-gray-400 line-through">
                      {formatPrice(product.mrp)}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#038a41]">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Inclusive of all taxes · Free Delivery on this item</p>
            </div>

            {/* Rating + Reviews Badge */}
            {product.rating?.count > 0 && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#238b45] text-white text-xs font-bold shadow-xs">
                  {product.rating.avg} <Star size={12} weight="fill" />
                </span>
                <span className="text-xs text-gray-600 font-semibold">
                  {product.rating.count} Ratings & Verified Reviews
                </span>
              </div>
            )}

            {/* Bank / Coupon Offer Strip */}
            <div className="p-3 rounded-[5px] bg-[#fff0f4] border border-[#ffccd8] flex items-center justify-between text-xs font-bold text-crimson-700">
              <div className="flex items-center gap-2">
                <Tag size={16} weight="fill" className="text-crimson shrink-0" />
                <span>Special 15% OFF Coupon Available</span>
              </div>
              <span className="px-2 py-0.5 rounded-[3px] bg-white border border-crimson/30 font-mono text-[11px] text-crimson">
                FESTIVE15
              </span>
            </div>

            {/* Product Summary */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Size Selector & Action Buttons */}
            <ProductActions product={product} />

            {/* PIN Code Delivery Checker with 5px radius */}
            <PinCodeCheck />

            {/* Accordion Tabs with 5px radius */}
            <div className="pt-2 border-t border-gray-200 space-y-1">
              <Accordion title="Product Specifications & Fabric Details" defaultOpen={true}>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700">
                  <li><strong>Fabric:</strong> {product.fabric}</li>
                  <li><strong>Care Instructions:</strong> {product.care}</li>
                  <li><strong>Occasion:</strong> {product.occasion?.join(", ")}</li>
                  <li><strong>Stitching:</strong> Handcrafted boutique quality from Tamil Nadu</li>
                </ul>
              </Accordion>

              <Accordion title="Delivery, Shipping & COD Information">
                <p className="text-xs text-gray-700 leading-relaxed">
                  We dispatch within 24–48 hours. Metro cities receive delivery in 2–4 days; all other PIN codes across India in 4–7 days. Cash on Delivery and all UPI apps supported.
                </p>
              </Accordion>

              <Accordion title="7-Day Hassle-Free Returns & Exchanges">
                <p className="text-xs text-gray-700 leading-relaxed">
                  Easy returns and size exchanges within 7 days of delivery with free reverse pickup. Custom-stitched blouses are eligible for free tailoring adjustments.
                </p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarProducts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
              Similar Styles You May Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
      <WhatsAppButton message={`Hello Agal Boutique! I am interested in ordering: ${product.name} (₹${product.price}).`} />
    </>
  );
}

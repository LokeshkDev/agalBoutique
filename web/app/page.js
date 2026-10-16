import HeroCarousel from "@/components/HeroCarousel";
import CategoryRow from "@/components/CategoryRow";
import NewArrivals from "@/components/NewArrivals";
import BestSellers from "@/components/BestSellers";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCmsSettings, getCategories, getProducts } from "@/lib/api";

export const metadata = {
  title: "Agal Boutique - Plus Size Varieties, Western & Festival Wear | Tops with Dupatta & Full Sets (M to 7XL)",
  description:
    "India's premier plus-size boutique specialized in plus size varieties (M to 7XL), festival season collections, premium quality fabrics, western wear, festival wear, 2-piece & 3-piece full sets, and tops with dupatta with easy availability, fast delivery & COD.",
  keywords: [
    "plus size varieties",
    "festival season collections",
    "premium quality fabrics",
    "western wear",
    "festival wear",
    "plus size ethnic wear",
    "plus size boutique India",
    "plus size sets",
    "plus size full sets",
    "plus size tops with dupatta",
    "top with dupatta 2 piece set",
    "straight cut 3 piece set",
    "anarkali 3 piece set",
    "100+ varieties plus size",
    "premium quality plus size clothing",
    "sizes M to 7XL",
    "easy availability plus size",
    "Agal Boutique",
  ],
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [cmsRes, catRes, newRes, bestRes] = await Promise.all([
    getCmsSettings(),
    getCategories(),
    getProducts({ isNew: true, limit: 12 }),
    getProducts({ isBestseller: true, limit: 12 }),
  ]);

  const heroSlides =
    cmsRes?.success && Array.isArray(cmsRes?.settings?.hero_slides)
      ? cmsRes.settings.hero_slides
      : [];

  const categories =
    catRes?.success && Array.isArray(catRes?.categories)
      ? catRes.categories
      : [];

  let newProducts =
    newRes?.success && Array.isArray(newRes?.products) && newRes.products.length > 0
      ? newRes.products
      : [];

  if (newProducts.length === 0) {
    const fallbackRes = await getProducts({ sort: "newest", limit: 8 });
    if (fallbackRes?.success && Array.isArray(fallbackRes.products)) {
      newProducts = fallbackRes.products;
    }
  }

  let bestProducts =
    bestRes?.success && Array.isArray(bestRes?.products) && bestRes.products.length > 0
      ? bestRes.products
      : [];

  if (bestProducts.length === 0) {
    const fallbackRes = await getProducts({ sort: "rating", limit: 8 });
    if (fallbackRes?.success && Array.isArray(fallbackRes.products)) {
      bestProducts = fallbackRes.products;
    }
  }

  const testimonials =
    cmsRes?.success && Array.isArray(cmsRes?.settings?.testimonials) && cmsRes.settings.testimonials.length > 0
      ? cmsRes.settings.testimonials
      : undefined;

  const firstHeroImage = heroSlides[0]?.image || heroSlides[0]?.banner_url;

  return (
    <>
      {/* Explicit LCP Image Preload for Immediate Discoverability */}
      {firstHeroImage && (
        <link
          rel="preload"
          as="image"
          href={firstHeroImage}
          fetchPriority="high"
        />
      )}

      {/* 1. Full-Width Meesho Style Carousel Banners (Database Loaded) */}
      <HeroCarousel initialSlides={heroSlides} />

      {/* 2. Shop by Category (Arched Pastel Dome Row) */}
      <CategoryRow initialCategories={categories} />

      {/* 3. New Arrivals */}
      <NewArrivals initialProducts={newProducts} />

      {/* 4. Best Sellers with Offer Strip */}
      <BestSellers initialProducts={bestProducts} />

      {/* 5. Customer Testimonials Slider */}
      <TestimonialsSlider initialTestimonials={testimonials} />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp */}
      <WhatsAppButton />
    </>
  );
}

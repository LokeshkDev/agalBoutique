import HeroCarousel from "@/components/HeroCarousel";
import CategoryRow from "@/components/CategoryRow";
import NewArrivals from "@/components/NewArrivals";
import BestSellers from "@/components/BestSellers";
import TestimonialsSlider from "@/components/TestimonialsSlider";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function HomePage() {
  return (
    <>
      {/* 1. Full-Width Meesho Style Carousel Banners */}
      <HeroCarousel />

      {/* 2. Shop by Category (Arched Pastel Dome Row) */}
      <CategoryRow />

      {/* 3. New Arrivals */}
      <NewArrivals />

      {/* 4. Best Sellers with Offer Strip */}
      <BestSellers />

      {/* 5. Customer Testimonials Slider */}
      <TestimonialsSlider />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp */}
      <WhatsAppButton />
    </>
  );
}

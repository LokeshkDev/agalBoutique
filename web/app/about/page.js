import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCmsSettings } from "@/lib/api";
import { Sparkle, Heart, ShieldCheck, Scissors } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "About Us | Agal Boutique",
  description: "Learn about Agal Boutique's Tamil Nadu handloom heritage, master weavers in Kanchipuram, and bespoke blouse stitching studio.",
};

const defaultAboutCms = {
  hero_title: "Handcrafted Elegance & Timeless Tamil Heritage",
  hero_subtitle: "Bridging centuries of Indian handloom weaving with modern boutique tailoring.",
  hero_image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
  story_headline: "Our Story: Rooted in Tamil Nadu's Weaving Heartlands",
  story_text: "Agal Boutique was founded with a passion to honor traditional Indian handlooms while offering contemporary women effortless elegance. Every piece in our collection is woven by master artisans across Kanchipuram, Coimbatore, and Madurai, then custom-fitted by our master tailors in Chennai.",
  story_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
  cards: [
    {
      title: "100% Authentic Handlooms",
      text: "Directly sourced from weaver cooperatives in Kanchipuram & Chettinad.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    },
    {
      title: "Custom Stitching Studio",
      text: "Bespoke blouse & saree tailoring dispatched in 3–5 days with free adjustment guarantee.",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
    },
    {
      title: "Sustainable Crafts",
      text: "Eco-friendly natural dyes, cambric cottons, and fair-wage artisan support.",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
    },
  ],
};

export default async function AboutPage() {
  const cmsRes = await getCmsSettings();
  const about = cmsRes?.settings?.about_cms || defaultAboutCms;

  return (
    <>
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-6 lg:py-10 space-y-12 font-sans animate-section-reveal">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 font-medium">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-plum transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-bold">About Us</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden bg-plum-900 text-white min-h-[360px] sm:min-h-[440px] flex items-center justify-center p-6 sm:p-12 shadow-lg">
          {about.hero_image && (
            <img
              src={about.hero_image}
              alt="Agal Boutique Heritage"
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          )}
          <div className="relative z-10 max-w-2xl text-center space-y-4">
            <span className="inline-block bg-plum/20 text-pink-200 border border-pink-300/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Boutique Craftsmanship
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
              {about.hero_title}
            </h1>
            <p className="text-sm sm:text-base text-pink-100 font-medium leading-relaxed max-w-xl mx-auto">
              {about.hero_subtitle}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-plum">
              Our Journey & Passion
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
              {about.story_headline}
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {about.story_text}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs font-bold text-gray-800">
              <div className="flex items-center gap-2">
                <Sparkle size={18} className="text-plum shrink-0" />
                <span>Hand-Drawn Zari Borders</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors size={18} className="text-plum shrink-0" />
                <span>3–5 Days Tailoring</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-plum shrink-0" />
                <span>Quality Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-plum shrink-0" />
                <span>Direct Weaver Pricing</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            {about.story_image && (
              <img
                src={about.story_image}
                alt="Our Story"
                className="w-full h-80 sm:h-96 object-cover rounded-2xl shadow-md border border-gray-200"
              />
            )}
          </div>
        </section>

        {/* Craftsmanship Cards Grid */}
        <section className="space-y-6 pt-6 border-t border-gray-200">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Our Core Pillars & Craftsmanship
            </h2>
            <p className="text-xs text-gray-500">
              Why thousands of discerning women trust Agal Boutique for their festive and bridal wardrobes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(about.cards || defaultAboutCms.cards).map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all group"
              >
                {card.image && (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-bold text-gray-900">{card.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="p-8 sm:p-12 rounded-2xl bg-[#faf2f7] border border-[#f3d6ea] text-center space-y-4">
          <h2 className="text-xl sm:text-3xl font-extrabold text-plum-900">
            Ready to Discover Handcrafted Luxury?
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 max-w-md mx-auto">
            Explore our latest Kanchipuram silk sarees, cambric cotton kurtis, and custom-stitched blouse collections.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-plum text-white font-bold text-xs hover:bg-plum-900 transition-colors shadow-sm"
            >
              Shop Boutique Collection
            </Link>
          </div>
        </section>
      </div>

      <Footer />
      <WhatsAppButton message="Hello Agal Boutique! I read your About Us page and would like to know more about your collections." />
    </>
  );
}


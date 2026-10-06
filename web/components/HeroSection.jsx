import Image from "next/image";
import Button from "@/components/Button";

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative py-8 lg:py-16 bg-white overflow-hidden">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-[#fbf5f7] border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-crimson" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-plum">
                Handpicked Boutique · Tamil Nadu
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight"
            >
              Handcrafted Sarees, Kurtis & Bespoke Tailoring
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg font-sans">
              Discover authentic Kanchipuram silks, breathable cambric cotton kurtis, and 3–5 day custom blouse stitching with express delivery across India.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button href="/shop" variant="primary">
                Shop All Collections
              </Button>
              <Button href="/shop?category=blouses" variant="outline">
                Custom Blouse Stitching
              </Button>
            </div>

            {/* Micro Trust Pills */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#e6f4ea] text-[#238b45] font-bold text-[10px] grid place-items-center">✓</span>
                Dispatch in 24–48 Hours
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#e6f4ea] text-[#238b45] font-bold text-[10px] grid place-items-center">✓</span>
                Free Delivery Above ₹999
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#e6f4ea] text-[#238b45] font-bold text-[10px] grid place-items-center">✓</span>
                Cash on Delivery Available
              </span>
            </div>
          </div>

          {/* Right Column: Hero Image with 5px radius and NO border */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] aspect-[3/4] rounded-[5px] overflow-hidden bg-gray-50 shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
                alt="Handcrafted festive silk saree styled at Agal Boutique"
                fill
                priority
                sizes="(max-width: 639px) 340px, 420px"
                className="object-cover"
              />

              {/* Floating Badge */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-[5px] bg-white/95 backdrop-blur-xs shadow-md">
                <p className="text-xs font-bold text-gray-900">Festive Silk & Cotton Edit</p>
                <p className="text-[11px] text-gray-500">Starting from ₹499 · Ready to dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

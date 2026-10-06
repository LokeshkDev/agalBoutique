import Image from "next/image";
import Button from "@/components/Button";
import { whatsappUrl } from "@/lib/format";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";

export default function TrustStory() {
  const waLink = whatsappUrl(
    "Hello Agal Boutique, I would like to enquire about custom stitching and ordering."
  );

  return (
    <section aria-labelledby="story-heading" className="py-10 lg:py-16 bg-blush/60 border-t border-line">
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 3 Plain Concrete Lines */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-[.08em] font-semibold text-plum">
                The Agal Promise
              </span>
              <h2
                id="story-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-serif text-plum-900 mt-1"
              >
                Custom tailoring, <em className="italic text-plum font-serif">delivered</em> to your door.
              </h2>
            </div>

            {/* 3 Plain sentences on how orders work */}
            <div className="space-y-4 text-ink/90 font-sans text-sm sm:text-base">
              <p className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-plum-100 text-plum font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Measure & Tailor:</strong> Share your measurements on WhatsApp or choose standard sizes; our master tailors stitch and finish your blouse in 3–5 working days.
                </span>
              </p>

              <p className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-plum-100 text-plum font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Fast Nationwide Dispatch:</strong> Direct courier shipping from Tamil Nadu reaches metros in 3–4 days and all other PIN codes across India in 5–7 days.
                </span>
              </p>

              <p className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-plum-100 text-plum font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Hassle-Free 7-Day Returns:</strong> If the fit isn't right, return or exchange unworn items within 7 days with quick doorstep reverse pickups.
                </span>
              </p>
            </div>
          </div>

          {/* Right Column: Studio Photo + WhatsApp Outline Action */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start lg:items-center text-center lg:text-left space-y-4">
            <div className="relative w-full max-w-[320px] aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden border border-line shadow-pop bg-ivory">
              <Image
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
                alt="Agal Boutique tailoring and fabric studio in Tamil Nadu"
                fill
                sizes="(max-width: 639px) 320px, 320px"
                className="object-cover"
              />
            </div>

            <div className="w-full max-w-[320px]">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full min-h-[48px] px-6 rounded-full border border-plum text-plum font-sans font-semibold text-sm hover:bg-plum-50 transition-colors"
              >
                <WhatsappLogo size={20} weight="fill" className="text-leaf" />
                Chat with our Stylist on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


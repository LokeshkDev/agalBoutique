import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCmsSettings } from "@/lib/api";
import { ArrowCounterClockwise, ShieldCheck, CheckCircle, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Refund & Exchange Policy | Agal Boutique",
  description:
    "Learn about our 7-day hassle-free returns and size exchanges for plus size varieties (M to 7XL), western wear, and full sets at Agal Boutique.",
};

const defaultRefund = {
  title: "Refund & Exchange Policy",
  subtitle: "Our commitment to hassle-free 7-day returns, size exchanges, and customer satisfaction.",
  banner_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
  content: `At Agal Boutique, your complete satisfaction with your ethnic wear is our utmost priority. We offer a transparent, customer-friendly 7-day return and exchange policy.

1. 7-Day Hassle-Free Returns & Size Exchanges
If you are not fully satisfied with your purchase or require a different size (sizes M to 7XL available), you may request a return or size exchange within 7 days of receiving your parcel.

2. Eligibility Conditions
• The garment must be unworn, unwashed, unaltered, and undamaged.
• Original price tags, brand labels, and boutique packaging must be intact.
• Products bought during clearance blowout sales are eligible for size exchange or store credit.

3. Process for Exchange / Return
To initiate a return or exchange:
• WhatsApp our customer care team at +91 63795 89711 with your Order ID and photos of the garment.
• Our team will arrange a reverse pickup from your doorstep or provide shipping instructions.

4. Refund Timelines
Once your returned parcel is received and inspected at our Chennai boutique studio:
• Online Payments: Refund will be processed back to the original source account (UPI / Bank / Card) within 3–5 working days.
• Cash on Delivery (COD): Refund will be transferred directly to your bank account or Google Pay / PhonePe UPI ID within 24–48 hours of verification.`,
  updated_at: "October 2026",
};

export default async function RefundPolicyPage() {
  const cmsRes = await getCmsSettings();
  const pageData = cmsRes?.settings?.policy_pages?.refund || defaultRefund;
  const bannerImage = pageData.banner_image || defaultRefund.banner_image;

  const paragraphs = (pageData.content || defaultRefund.content)
    .split("\n\n")
    .filter(Boolean);

  return (
    <>
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-6 lg:py-10 space-y-8 font-sans animate-section-reveal">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 font-medium">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-plum transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-bold">Refund Policy</li>
          </ol>
        </nav>

        {/* Hero Banner Header */}
        <div className="relative rounded-2xl overflow-hidden bg-plum-900 text-white min-h-[220px] sm:min-h-[280px] flex items-center justify-center p-6 sm:p-10 shadow-md">
          {bannerImage && (
            <img
              src={bannerImage}
              alt="Refund Policy Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          )}
          <div className="relative z-10 max-w-2xl text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-pink-200 border border-white/20 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              <ArrowCounterClockwise size={14} /> 7-Day Guarantee
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
              {pageData.title || defaultRefund.title}
            </h1>
            <p className="text-xs sm:text-sm text-pink-100 font-medium max-w-lg mx-auto">
              {pageData.subtitle || defaultRefund.subtitle}
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 text-xs text-gray-500 font-semibold">
            <span>Last Updated: {pageData.updated_at || "October 2026"}</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck size={16} /> 100% Buyer Protection
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-gray-900">Need to initiate an exchange or return?</p>
              <p className="text-gray-500">Share your order details on WhatsApp for immediate support.</p>
            </div>
            <a
              href="https://wa.me/916379589711?text=Hello%20Agal%20Boutique,%20I%20would%20like%20to%20request%20a%20size%20exchange%20/%20return%20for%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-extrabold hover:bg-[#1ebc59] transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <WhatsappLogo size={18} weight="fill" />
              <span>WhatsApp Helpline (+91 63795 89711)</span>
            </a>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton message="Hello Agal Boutique! I would like to inquire about returning or exchanging an item." />
    </>
  );
}


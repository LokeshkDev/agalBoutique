import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCmsSettings } from "@/lib/api";
import { ShieldCheck, FileText, CheckCircle } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Terms and Conditions | Agal Boutique",
  description:
    "Review terms and conditions for shopping at Agal Boutique - plus size varieties (M to 7XL), 100+ varieties of sets, tops with dupatta, and boutique policies.",
};

const defaultTerms = {
  title: "Terms and Conditions",
  subtitle: "Please review our terms of service, boutique policies, and order agreements.",
  banner_image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
  content: `Welcome to Agal Boutique. By accessing or shopping on our website (agalboutique.com), you agree to comply with and be bound by the following terms and conditions.

1. Product Authenticity & Handcrafted Variation
All sarees, kurtis, 2-piece sets, 3-piece full sets, and ethnic wear are handcrafted with premium fabrics. Due to authentic handloom weaving and artisan dying processes, minor variations in weave texture, motifs, and shade are characteristic of handloom authenticity and not considered defects.

2. Plus Size Sizing (M to 7XL)
We specialize in plus size varieties from M to 7XL. Please refer to our detailed size chart before ordering. For any sizing guidance or assistance, reach out to our team via WhatsApp.

3. Pricing & Taxes
All listed prices are in Indian Rupees (INR) and are inclusive of applicable GST unless explicitly stated otherwise. Delivery and shipping charges are calculated at checkout based on chosen payment method and order value.

4. Orders & Cancellations
Orders can be canceled within 12 hours of placement or prior to dispatch, whichever is earlier. Once an order has been dispatched, standard refund and exchange policies apply.

5. Delivery & Transit
We partner with premier courier services across India. Normal delivery transit is 3-5 business days across Tamil Nadu & major metropolitan cities, and 4-7 business days for other regional areas. Agal Boutique is not liable for force majeure transit delays.`,
  updated_at: "October 2026",
};

export default async function TermsPage() {
  const cmsRes = await getCmsSettings();
  const pageData = cmsRes?.settings?.policy_pages?.terms || defaultTerms;
  const bannerImage = pageData.banner_image || defaultTerms.banner_image;

  const paragraphs = (pageData.content || defaultTerms.content)
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
            <li className="text-gray-900 font-bold">Terms and Conditions</li>
          </ol>
        </nav>

        {/* Hero Banner Header */}
        <div className="relative rounded-2xl overflow-hidden bg-plum-900 text-white min-h-[220px] sm:min-h-[280px] flex items-center justify-center p-6 sm:p-10 shadow-md">
          {bannerImage && (
            <img
              src={bannerImage}
              alt="Terms Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          )}
          <div className="relative z-10 max-w-2xl text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-pink-200 border border-white/20 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              <FileText size={14} /> Legal & Storefront Policy
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
              {pageData.title || defaultTerms.title}
            </h1>
            <p className="text-xs sm:text-sm text-pink-100 font-medium max-w-lg mx-auto">
              {pageData.subtitle || defaultTerms.subtitle}
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 text-xs text-gray-500 font-semibold">
            <span>Last Updated: {pageData.updated_at || "October 2026"}</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck size={16} /> Official Agal Boutique Policy
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>Questions about our terms? We are glad to help.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-plum/10 text-plum font-bold hover:bg-plum/20 transition-colors"
            >
              Contact Boutique Support &rarr;
            </Link>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton message="Hello Agal Boutique! I have a question regarding your store terms and conditions." />
    </>
  );
}


import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCmsSettings } from "@/lib/api";
import { LockKey, ShieldCheck, CheckCircle } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Privacy Policy | Agal Boutique",
  description:
    "Read Agal Boutique's privacy policy regarding data protection, customer privacy, and safe shopping for women's plus size ethnic wear.",
};

const defaultPrivacy = {
  title: "Privacy Policy",
  subtitle: "How Agal Boutique protects your personal information, contact details, and transactions.",
  banner_image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
  content: `Agal Boutique is committed to respecting and protecting the privacy of our esteemed customers. This Privacy Policy outlines our data handling practices.

1. Information We Collect
We collect necessary details required to deliver your orders and provide personalized styling support:
• Contact Information: Full name, phone/WhatsApp number, delivery address, city, state, pin code, and email address.
• Sizing & Fitting Preferences: Selected dress sizes (M to 7XL) and preferred styles.
• Transaction History: Order details, invoice references, and chosen payment methods (Online Payment / Cash on Delivery). Note: We DO NOT store your card numbers or UPI PINs; all online transactions are securely encrypted by RBI-regulated payment gateways.

2. How We Use Your Information
• Processing, packaging, and dispatching your orders.
• Sending order status notifications and tax invoices directly to your phone via WhatsApp / SMS.
• Providing 1-on-1 boutique customer service and size advice.

3. Data Protection & Sharing
We never sell, rent, or trade your personal data with third-party advertising companies. Your details are shared solely with logistics partners (e.g., courier services) strictly to ensure safe delivery of your parcel.

4. Contact Our Data Protection Team
If you have any questions regarding your data or wish to update your details, contact us anytime at care@agalboutique.com or WhatsApp +91 63795 89711.`,
  updated_at: "October 2026",
};

export default async function PrivacyPolicyPage() {
  const cmsRes = await getCmsSettings();
  const pageData = cmsRes?.settings?.policy_pages?.privacy || defaultPrivacy;
  const bannerImage = pageData.banner_image || defaultPrivacy.banner_image;

  const paragraphs = (pageData.content || defaultPrivacy.content)
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
            <li className="text-gray-900 font-bold">Privacy Policy</li>
          </ol>
        </nav>

        {/* Hero Banner Header */}
        <div className="relative rounded-2xl overflow-hidden bg-plum-900 text-white min-h-[220px] sm:min-h-[280px] flex items-center justify-center p-6 sm:p-10 shadow-md">
          {bannerImage && (
            <img
              src={bannerImage}
              alt="Privacy Policy Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          )}
          <div className="relative z-10 max-w-2xl text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-pink-200 border border-white/20 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              <LockKey size={14} /> Data Privacy & Protection
            </span>
            <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
              {pageData.title || defaultPrivacy.title}
            </h1>
            <p className="text-xs sm:text-sm text-pink-100 font-medium max-w-lg mx-auto">
              {pageData.subtitle || defaultPrivacy.subtitle}
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 text-xs text-gray-500 font-semibold">
            <span>Last Updated: {pageData.updated_at || "October 2026"}</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck size={16} /> 256-Bit Encrypted Security
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
            <p>Your privacy is respected at every step.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-plum/10 text-plum font-bold hover:bg-plum/20 transition-colors"
            >
              Contact Privacy Team &rarr;
            </Link>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton message="Hello Agal Boutique! I have a question regarding your data and privacy practices." />
    </>
  );
}


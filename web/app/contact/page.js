"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCmsSettings } from "@/lib/api";
import { WhatsappLogo, Phone, EnvelopeSimple, MapPin, Clock, PaperPlaneRight, CheckCircle } from "@phosphor-icons/react";

const defaultContactCms = {
  title: "Visit Our Boutique or Get in Touch",
  subtitle: "We're here to assist you with orders, plus size sizing, or styling queries.",
  whatsapp: "+91 63795 89711",
  phone: "+91 63795 89711",
  email: "support@agalboutique.com",
  address: "124 Boutique Street, Opp. Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017",
  hours: "Monday – Saturday: 10:00 AM – 9:00 PM | Sunday: 11:00 AM – 7:00 PM",
  map_url: "https://maps.google.com/maps?q=T.+Nagar,+Chennai&t=&z=13&ie=UTF8&iwloc=&output=embed",
  banner_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
};

export default function ContactPage() {
  const [contact, setContact] = useState(defaultContactCms);

  useEffect(() => {
    getCmsSettings().then((res) => {
      if (res?.settings?.contact_cms) {
        setContact((prev) => ({ ...prev, ...res.settings.contact_cms }));
      }
    });
  }, []);

  return (
    <>
      <div className="max-w-[var(--container)] mx-auto px-4 lg:px-8 py-6 lg:py-10 space-y-10 font-sans animate-section-reveal">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 font-medium">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-plum transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-bold">Contact Us</li>
          </ol>
        </nav>

        {/* Header Title Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-plum bg-plum/10 px-3 py-1 rounded-full border border-plum/20">
            Customer Support & Studio Visit
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
            {contact.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            {contact.subtitle}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <WhatsappLogo size={22} weight="fill" />
            </div>
            <h3 className="text-xs font-bold text-gray-900">WhatsApp Support</h3>
            <p className="text-xs text-gray-600 font-semibold">{contact.whatsapp}</p>
            <a
              href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, "") || "916379589711"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] font-bold text-emerald-700 hover:underline pt-1"
            >
              Start Chat &rarr;
            </a>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-plum flex items-center justify-center">
              <Phone size={22} weight="fill" />
            </div>
            <h3 className="text-xs font-bold text-gray-900">Phone Helpline</h3>
            <p className="text-xs text-gray-600 font-semibold">{contact.phone}</p>
            <a
              href={`tel:${contact.phone?.replace(/\s+/g, "") || "+916379589711"}`}
              className="inline-block text-[11px] font-bold text-plum hover:underline pt-1"
            >
              Call Us &rarr;
            </a>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <EnvelopeSimple size={22} weight="fill" />
            </div>
            <h3 className="text-xs font-bold text-gray-900">Email Inquiry</h3>
            <p className="text-xs text-gray-600 font-semibold truncate">{contact.email}</p>
            <a
              href={`mailto:${contact.email}`}
              className="inline-block text-[11px] font-bold text-blue-700 hover:underline pt-1"
            >
              Send Email &rarr;
            </a>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={22} weight="fill" />
            </div>
            <h3 className="text-xs font-bold text-gray-900">Operating Hours</h3>
            <p className="text-xs text-gray-600 leading-snug">{contact.hours}</p>
          </div>
        </div>

        {/* Boutique Storefront Address & Google Maps Embed */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Boutique Storefront Address</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 leading-relaxed font-medium">
                  {contact.address}
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, "") || "916379589711"}?text=Hello%20Agal%20Boutique,%20I%20would%20like%20directions%20or%20an%20in-store%20styling%20appointment.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-extrabold hover:bg-[#20b858] transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <WhatsappLogo size={18} weight="fill" />
              <span>Book Styling Appointment</span>
            </a>
          </div>

          {/* Google Map iframe */}
          <div className="h-80 sm:h-96 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
            <iframe
              title="Boutique Location Map"
              src={contact.map_url || "https://maps.google.com/maps?q=T.+Nagar,+Chennai&t=&z=13&ie=UTF8&iwloc=&output=embed"}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton message={`Hello Agal Boutique! I would like to inquire about: ${contact.title}`} />
    </>
  );
}


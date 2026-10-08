"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCmsSettings } from "@/lib/api";
import { WhatsappLogo, Phone, EnvelopeSimple, MapPin, Clock, PaperPlaneRight, CheckCircle } from "@phosphor-icons/react";

const defaultContactCms = {
  title: "Visit Our Boutique or Get in Touch",
  subtitle: "We're here to assist you with orders, custom stitching, or styling queries.",
  whatsapp: "+91 98765 43210",
  phone: "+91 98765 43210",
  email: "support@agalboutique.com",
  address: "124 Boutique Street, Opp. Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017",
  hours: "Monday – Saturday: 10:00 AM – 9:00 PM | Sunday: 11:00 AM – 7:00 PM",
  map_url: "https://maps.google.com/maps?q=T.+Nagar,+Chennai&t=&z=13&ie=UTF8&iwloc=&output=embed",
  banner_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
};

export default function ContactPage() {
  const [contact, setContact] = useState(defaultContactCms);
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "Order Inquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCmsSettings().then((res) => {
      if (res?.settings?.contact_cms) {
        setContact((prev) => ({ ...prev, ...res.settings.contact_cms }));
      }
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", phone: "", email: "", subject: "Order Inquiry", message: "" });
    }, 800);
  };

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
              href={`https://wa.me/${contact.whatsapp?.replace(/\D/g, "")}`}
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
            <span className="text-[11px] text-gray-400 block pt-1">Call for urgent orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <EnvelopeSimple size={22} weight="fill" />
            </div>
            <h3 className="text-xs font-bold text-gray-900">Email Inquiry</h3>
            <p className="text-xs text-gray-600 font-semibold truncate">{contact.email}</p>
            <span className="text-[11px] text-gray-400 block pt-1">Replies within 24h</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={22} weight="fill" />
            </div>
            <h3 className="text-xs font-bold text-gray-900">Operating Hours</h3>
            <p className="text-xs text-gray-600 leading-snug">{contact.hours}</p>
          </div>
        </div>

        {/* Main Grid: Form + Address Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Send Us a Direct Message</h2>
              <p className="text-xs text-gray-500">Fill in your inquiry below and our boutique fashion team will respond immediately.</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle size={44} className="text-emerald-600 mx-auto" weight="fill" />
                <h3 className="text-sm font-bold text-emerald-900">Inquiry Sent Successfully!</h3>
                <p className="text-xs text-emerald-700">Thank you for reaching out. We will call or WhatsApp you back shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-xs font-bold text-plum hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Anitha Kumar"
                      className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="anitha@example.com"
                      className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum bg-white"
                    >
                      <option value="Order Inquiry">Order Inquiry / Tracking</option>
                      <option value="Custom Stitching">Custom Stitching Request</option>
                      <option value="Bulk Order">Bridal / Bulk Order</option>
                      <option value="General Feedback">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide details about your query or stitching requirements..."
                    className="w-full p-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-plum text-white font-bold text-xs rounded-lg hover:bg-plum-900 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PaperPlaneRight size={16} />
                  <span>{loading ? "Sending Message..." : "Submit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Address & Google Maps Embed */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
              <MapPin size={24} className="text-plum shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Boutique Storefront Address</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed font-medium">
                  {contact.address}
                </p>
              </div>
            </div>

            {/* Google Map iframe */}
            <div className="h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <iframe
                title="Boutique Location Map"
                src={contact.map_url || "https://maps.google.com/maps?q=T.+Nagar,+Chennai&t=&z=13&ie=UTF8&iwloc=&output=embed"}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton message={`Hello Agal Boutique! I would like to inquire about: ${contact.title}`} />
    </>
  );
}


"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { whatsappUrl } from "@/lib/format";

export default function WhatsAppButton({ message }) {
  const url = whatsappUrl(
    message || "Hello Agal Boutique! I would like to enquire about your products and custom stitching."
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#25D366] text-white shadow-pop hover:scale-105 transition-transform duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsappLogo size={24} weight="fill" />
      <span className="hidden sm:inline text-xs font-semibold font-sans">
        WhatsApp Order / Enquiry
      </span>
    </a>
  );
}


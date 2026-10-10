"use client";

import { useState, useEffect } from "react";
import { getCmsSettings } from "@/lib/api";
import { Sparkle } from "@phosphor-icons/react";

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState({
    text: "✨ Free Express Delivery across India on orders above ₹999 | Direct WhatsApp Support",
    enabled: true,
  });

  useEffect(() => {
    getCmsSettings().then((res) => {
      if (res?.settings?.announcement_bar) {
        setAnnouncement(res.settings.announcement_bar);
      }
    });
  }, []);

  if (!announcement || announcement.enabled === false || !announcement.text?.trim()) {
    return null;
  }

  const textContent = announcement.text.trim();

  return (
    <div className="bg-[#581c87] text-white text-[11px] sm:text-xs font-semibold py-1.5 overflow-hidden relative shadow-inner z-50 select-none border-b border-purple-900/40">
      <div className="w-full flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="flex items-center gap-3 tracking-wide">
              <Sparkle size={14} weight="fill" className="text-amber-300 shrink-0" />
              <span>{textContent}</span>
              <Sparkle size={14} weight="fill" className="text-amber-300 shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleComplete = () => {
      setFadeOut(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    };

    if (document.readyState === "complete") {
      const timer = setTimeout(handleComplete, 250);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener("load", handleComplete);
      return () => window.removeEventListener("load", handleComplete);
    }
  }, []);

  // Brief smooth loader transition on route changes
  useEffect(() => {
    setLoading(true);
    setFadeOut(false);
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 350);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-4 transition-opacity duration-400 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {/* Logo Container with soft pulse */}
        <div className="relative w-36 sm:w-44 h-14 sm:h-16 flex items-center justify-center animate-pulse">
          <Image
            src="/logo.png"
            alt="Agal Boutique"
            width={160}
            height={60}
            priority
            className="w-auto h-12 sm:h-14 object-contain"
          />
        </div>

        {/* Boutique Styled Spinner */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-pink-100"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-[#8a2a6f] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-bold text-[#8a2a6f] tracking-widest uppercase font-sans">
            Agal Boutique
          </p>
          <p className="text-[11px] text-gray-400 font-sans">
            Handcrafted Indian Fashion & Tailoring
          </p>
        </div>
      </div>
    </div>
  );
}


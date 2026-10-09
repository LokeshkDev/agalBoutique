"use client";

import { useState } from "react";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/api";

export default function ProductGallery({ images = [], name }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!images.length) return null;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
      {/* Thumbnails (Desktop: Vertical strip, Mobile: Horizontal strip) */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar lg:overflow-visible">
        {images.map((img, idx) => {
          const thumbUrl = normalizeImageUrl(img);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`relative w-16 sm:w-20 aspect-[3/4] rounded-[5px] overflow-hidden shrink-0 transition-all cursor-pointer ${
                selectedIdx === idx
                  ? "ring-2 ring-plum shadow-xs"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={thumbUrl}
                alt={typeof img === "object" ? (img.alt || `${name} thumbnail ${idx + 1}`) : `${name} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Main Feature Image with 5px radius and NO border */}
      <div className="relative w-full aspect-[3/4] rounded-[5px] overflow-hidden bg-gray-50 shadow-md">
        <Image
          src={normalizeImageUrl(images[selectedIdx] || images[0])}
          alt={typeof images[selectedIdx] === "object" ? (images[selectedIdx]?.alt || name) : name}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 550px"
          className="object-cover transition-all duration-200"
        />

        {/* Dots indicator for mobile */}
        {images.length > 1 && (
          <div className="lg:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  selectedIdx === idx ? "w-5 bg-plum" : "w-1.5 bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

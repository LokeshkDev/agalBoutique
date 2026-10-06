"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

/**
 * Collapsible accordion section for product details, fabric & care, returns.
 *
 * @param {string} title
 * @param {boolean} [defaultOpen]
 * @param {React.ReactNode} children
 */
export default function Accordion({
  title,
  defaultOpen = false,
  children,
  className = "",
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-line ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center justify-between w-full py-4 text-left cursor-pointer group"
      >
        <span className="text-sm font-semibold font-sans text-ink">
          {title}
        </span>
        <CaretDown
          size={18}
          weight="bold"
          className={`text-muted transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-[var(--dur)] ease-[var(--ease)] ${
          open ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-sm text-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}


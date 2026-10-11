"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";

export default function Sheet({ open, onClose, title, side = "right", children }) {
  const sheetRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const timer = setTimeout(() => {
        setVisible(true);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!sheetRef.current) return;
        const focusableElements = sheetRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!mounted || typeof document === "undefined") return null;

  const isLeft = side === "left";
  const isBottom = side === "bottom";

  const getPositionClasses = () => {
    if (isLeft) {
      return `inset-y-0 left-0 right-auto w-[85vw] max-w-[380px] sm:w-[420px] h-full ${
        visible ? "translate-x-0" : "-translate-x-full"
      }`;
    }
    if (isBottom) {
      return `inset-x-0 bottom-0 max-h-[85vh] rounded-t-[24px] sm:max-w-md sm:mx-auto sm:mb-6 sm:rounded-[24px] sm:border sm:border-gray-200 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`;
    }
    // Default right drawer (becomes bottom sheet on small mobile screens < 768px)
    return `inset-x-0 bottom-0 max-h-[88vh] rounded-t-[20px] md:rounded-none md:max-h-none md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:h-full ${
      visible
        ? "translate-y-0 md:translate-y-0 md:translate-x-0"
        : "translate-y-full md:translate-y-0 md:translate-x-full"
    }`;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 cursor-pointer ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer / Bottom Sheet Container */}
      <div
        ref={sheetRef}
        className={`fixed bg-white text-gray-900 flex flex-col shadow-2xl z-10 transition-transform duration-250 ease-out ${getPositionClasses()}`}
      >
        {/* Mobile drag handle (for bottom sheets) */}
        {!isLeft && (
          <div
            className={`${isBottom ? "flex" : "md:hidden flex"} justify-center pt-3 pb-1`}
            aria-hidden="true"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white shrink-0">
          <h2
            id="sheet-title"
            className="text-lg sm:text-xl font-bold text-gray-900 font-sans"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close sheet"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Scrollable Children */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

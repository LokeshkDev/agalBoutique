"use client";

import { useState } from "react";
import { X, Ruler, CheckCircle, Info } from "@phosphor-icons/react";

const SIZE_CHARTS = {
  kurtis: {
    title: "Kurtis, Tunics & Full Sets",
    subtitle: "Standard Indian Women's Apparel Sizing (Cambric Cotton, Rayon, Silk)",
    headers: ["Size", "Bust (Chest)", "Waist", "Hips", "Shoulder", "Length"],
    rows: [
      { size: "S (36)", bust: "36 in / 91 cm", waist: "32 in / 81 cm", hips: "39 in / 99 cm", shoulder: "14.5 in", length: "42-44 in" },
      { size: "M (38)", bust: "38 in / 96 cm", waist: "34 in / 86 cm", hips: "41 in / 104 cm", shoulder: "15.0 in", length: "44-45 in" },
      { size: "L (40)", bust: "40 in / 101 cm", waist: "36 in / 91 cm", hips: "43 in / 109 cm", shoulder: "15.5 in", length: "45-46 in" },
      { size: "XL (42)", bust: "42 in / 106 cm", waist: "38 in / 96 cm", hips: "45 in / 114 cm", shoulder: "16.0 in", length: "46 in" },
      { size: "XXL (44)", bust: "44 in / 111 cm", waist: "40 in / 101 cm", hips: "47 in / 119 cm", shoulder: "16.5 in", length: "46 in" },
    ],
  },
  blouses: {
    title: "Readymade & Custom Blouses",
    subtitle: "Boutique Stitching Measurement Chart (Tamil Nadu Master Tailoring)",
    headers: ["Blouse Size", "Bust Size", "Underbust / Band", "Front Neck Depth", "Back Neck Depth"],
    rows: [
      { size: "Size 32", bust: "32 in", waist: "26-27 in", hips: "6.5 in", shoulder: "10-11 in" },
      { size: "Size 34", bust: "34 in", waist: "28-29 in", hips: "7.0 in", shoulder: "10.5-11.5 in" },
      { size: "Size 36", bust: "36 in", waist: "30-31 in", hips: "7.0 in", shoulder: "11-12 in" },
      { size: "Size 38", bust: "38 in", waist: "32-33 in", hips: "7.5 in", shoulder: "11.5-12.5 in" },
      { size: "Size 40", bust: "40 in", waist: "34-35 in", hips: "7.5 in", shoulder: "12-13 in" },
      { size: "Size 42", bust: "42 in", waist: "36-37 in", hips: "8.0 in", shoulder: "12.5-13.5 in" },
    ],
  },
  sarees: {
    title: "Sarees & Petticoats / Inskirts",
    subtitle: "Handloom Saree Length & Petticoat Waist Dimensions",
    headers: ["Type", "Standard Length", "Width", "Blouse Piece", "Petticoat Waist"],
    rows: [
      { size: "Kanchipuram Silk", bust: "5.5 Mtrs", waist: "45-47 in", hips: "0.8 Mtr (Unstitched)", shoulder: "28-40 in Elastic" },
      { size: "Soft Silk & Linen", bust: "5.5 Mtrs", waist: "44-46 in", hips: "0.8 Mtr (Unstitched)", shoulder: "28-40 in Elastic" },
      { size: "Cotton Handloom", bust: "5.5 Mtrs", waist: "45 in", hips: "Included", shoulder: "28-42 in Drawstring" },
      { size: "Ready-to-Wear Saree", bust: "Pre-pleated", waist: "44 in", hips: "Attached", shoulder: "26-38 in Hook" },
    ],
  },
  kidswear: {
    title: "Girls Pattu Pavadai & Kidswear",
    subtitle: "South Indian Traditional Jacquard Silk Sizing by Age Group",
    headers: ["Age Group", "Chest", "Skirt (Pavadai) Length", "Blouse Length"],
    rows: [
      { size: "1 - 2 Years", bust: "20-22 in", waist: "18-20 in", hips: "4.0 in", shoulder: "-" },
      { size: "3 - 4 Years", bust: "23-24 in", waist: "22-24 in", hips: "4.5 in", shoulder: "-" },
      { size: "5 - 6 Years", bust: "25-26 in", waist: "26-28 in", hips: "5.0 in", shoulder: "-" },
      { size: "7 - 8 Years", bust: "27-28 in", waist: "30-32 in", hips: "5.5 in", shoulder: "-" },
      { size: "9 - 10 Years", bust: "29-30 in", waist: "34-36 in", hips: "6.0 in", shoulder: "-" },
    ],
  },
};

export default function SizeGuideModal({ open, onClose, category = "Kurtis" }) {
  const normalizedCat = (category || "").toLowerCase();
  let defaultTab = "kurtis";
  if (normalizedCat.includes("blouse")) defaultTab = "blouses";
  else if (normalizedCat.includes("saree")) defaultTab = "sarees";
  else if (normalizedCat.includes("kid")) defaultTab = "kidswear";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [unit, setUnit] = useState("in"); // "in" or "cm"

  if (!open) return null;

  const currentChart = SIZE_CHARTS[activeTab] || SIZE_CHARTS.kurtis;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-200 relative animate-scaleIn max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar in Agal Boutique Theme Plum */}
        <div className="bg-plum text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Ruler size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
                Agal Boutique Size Guide
              </h3>
              <p className="text-[11px] text-white/80 mt-1 font-medium">
                Find your perfect fit across handlooms, kurtis & blouses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close Size Guide"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-gray-200 pb-2">
            {[
              { id: "kurtis", label: "Kurtis & Suits" },
              { id: "blouses", label: "Blouses" },
              { id: "sarees", label: "Sarees" },
              { id: "kidswear", label: "Kidswear" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-plum text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Header & Unit Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#faf5f8] p-3.5 rounded-xl border border-plum/15">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-plum-900">
                {currentChart.title}
              </h4>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                {currentChart.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setUnit("in")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  unit === "in" ? "bg-plum text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Inches (in)
              </button>
              <button
                onClick={() => setUnit("cm")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  unit === "cm" ? "bg-plum text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                CM (cm)
              </button>
            </div>
          </div>

          {/* Measurement Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  {currentChart.headers.map((h, idx) => (
                    <th key={idx} className="py-2.5 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {currentChart.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-plum/5 transition-colors">
                    <td className="py-2.5 px-3 font-extrabold text-plum-900 bg-plum/5">
                      {row.size}
                    </td>
                    <td className="py-2.5 px-3 font-medium">{row.bust}</td>
                    <td className="py-2.5 px-3 font-medium">{row.waist}</td>
                    <td className="py-2.5 px-3 font-medium">{row.hips}</td>
                    {row.shoulder && <td className="py-2.5 px-3 font-medium">{row.shoulder}</td>}
                    {row.length && <td className="py-2.5 px-3 font-medium">{row.length}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual Fitting Guidance */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle size={16} weight="fill" />
              <span>How to Measure Your Body Correctly:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-900 leading-relaxed font-medium pl-1">
              <li><strong>Bust/Chest:</strong> Measure across the fullest part of your chest with tape snug, not tight.</li>
              <li><strong>Waist:</strong> Measure around your natural waistline (narrowest part above belly button).</li>
              <li><strong>Margin Guarantee:</strong> All readymade blouses come with 2-inch inner margins for easy home altering.</li>
            </ul>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500 font-medium">
            Need custom size assistance? WhatsApp us for 1-on-1 tailoring support.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-plum text-white text-xs font-bold rounded-lg hover:bg-plum-900 transition-colors cursor-pointer shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}


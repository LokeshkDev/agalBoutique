"use client";

import { useState } from "react";
import { UploadSimple, CheckCircle, Spinner, Image as ImageIcon } from "@phosphor-icons/react";
import { adminUploadImage } from "@/lib/api";

export default function ImageUploadInput({ label = "Image", value = "", onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setUploadStats(null);

    const res = await adminUploadImage(file);
    setUploading(false);

    if (res?.success && res.url) {
      onChange(res.url);
      setUploadStats({
        originalSizeKb: res.originalSizeKb,
        optimizedSizeKb: res.optimizedSizeKb,
        savedPercent: res.savedPercent,
        storage: res.storage,
      });
    } else {
      setError(res?.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="space-y-1.5 font-sans">
      <label className="block text-xs font-semibold text-gray-700">{label}</label>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Direct File Input Button */}
          <label className="flex items-center gap-2 px-3 py-2 bg-plum/10 text-plum hover:bg-plum/20 rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0">
            {uploading ? (
              <>
                <Spinner size={16} className="animate-spin" />
                <span>Compressing & Uploading...</span>
              </>
            ) : (
              <>
                <UploadSimple size={16} />
                <span>Upload & Optimize File</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <span className="text-[11px] text-gray-400 font-medium">OR paste URL</span>
        </div>

        {/* Text Input for URL preview */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or click Upload button above"
          className="w-full h-9 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum font-mono"
        />

        {/* Optimization Stats Badge */}
        {uploadStats && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] font-bold text-emerald-800">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <span>
                R2 WebP Optimized: {uploadStats.originalSizeKb} KB → {uploadStats.optimizedSizeKb} KB ({uploadStats.savedPercent}% smaller)
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-600 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
              {uploadStats.storage}
            </span>
          </div>
        )}

        {error && (
          <div className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Image Preview */}
        {value && (
          <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <img
              src={value}
              alt="Preview"
              className="w-12 h-12 object-cover rounded bg-white border border-gray-200 shrink-0"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="truncate text-[11px]">
              <span className="font-semibold text-gray-700 block">Current Image URL:</span>
              <span className="text-gray-500 font-mono truncate block">{value}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  SortAscending,
  X,
  Check,
  SquaresFour,
  Tag,
  ArrowsDownUp,
  Sparkle,
} from "@phosphor-icons/react";
import Sheet from "@/components/Sheet";
import Button from "@/components/Button";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Customer Rating", value: "rating" },
  { label: "Biggest Discount", value: "discount" },
];

const AVAILABLE_SIZES = [
  "XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size",
  "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56",
];

const AVAILABLE_FABRICS = [
  "Cotton",
  "Rayon",
  "Mulmul Cotton",
  "Chanderi Silk",
  "Roman Silk",
  "Raw Silk",
  "Rayon Cotton",
  "Two-Tone Cotton",
  "Glass Silk",
  "Tissue Silk",
  "Cotton Blended",
  "Chettinad Cotton",
  "Butter Silk",
  "Vietnam Silk",
  "Mul Chanderi Silk",
  "Dhabu Cotton",
  "Pure Silk",
  "Georgette",
  "Organza",
];

const AVAILABLE_OCCASIONS = [
  "Daily Wear",
  "Office Wear",
  "Festive",
  "Party Wear",
  "Wedding / Bridal",
];

export default function ShopFilters({ totalCount, categories = [], categoryName = "All Collections" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSubcategory = searchParams.get("subcategory") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentSize = searchParams.get("size") || "";
  const currentFabric = searchParams.get("fabric") || "";
  const currentOccasion = searchParams.get("occasion") || "";

  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Helper to update query params
  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset subcategory if category explicitly changed and no subcategory given
    if ("category" in updates && !("subcategory" in updates)) {
      params.delete("subcategory");
    }

    // Reset page on filter change
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
    setFilterSheetOpen(false);
    setSortSheetOpen(false);
  };

  const activeFiltersCount = [
    currentCategory,
    currentSubcategory,
    currentSize,
    currentFabric,
    currentOccasion,
  ].filter(Boolean).length;

  return (
    <>
      {/* Desktop Compact Header (Title + Count on Left, Filter Icon & Sort on Right) */}
      <div className="hidden lg:flex items-center justify-between pb-3.5 border-b border-gray-200 mb-3">
        {/* Title & Count Only - No Description */}
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {categoryName || "All Collections"}
          </h1>
          <span className="text-sm text-gray-500 font-bold">
            ({totalCount} {totalCount === 1 ? "Product" : "Products"})
          </span>
        </div>

        {/* Action Controls: Filter Icon Button & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="h-9 px-4 rounded-full border border-gray-300 bg-white hover:border-plum text-gray-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs hover:text-plum active:scale-95"
            title="Open Product Filters"
          >
            <SlidersHorizontal size={16} weight="bold" className="text-plum" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-plum text-white text-[11px] font-black grid place-items-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <label htmlFor="desktop-sort" className="text-xs text-gray-500 font-semibold">
              Sort by:
            </label>
            <select
              id="desktop-sort"
              value={currentSort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="h-9 text-xs font-bold px-3 pr-8 rounded-full border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-plum cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Top Header & Control Bar */}
      <div className="lg:hidden mb-2">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            {categoryName || "All Collections"}
          </h1>
          <span className="text-xs text-gray-500 font-bold">
            ({totalCount} {totalCount === 1 ? "Product" : "Products"})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 py-1">
          <button
            type="button"
            onClick={() => setSortSheetOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#fcf5f8] border border-[#f3e3ee] text-gray-900 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
          >
            <SortAscending size={18} weight="bold" className="text-plum" />
            <span>Sort</span>
            {currentSort !== "newest" && (
              <span className="w-1.5 h-1.5 rounded-full bg-plum"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#fcf5f8] border border-[#f3e3ee] text-gray-900 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-2xs relative"
          >
            <SlidersHorizontal size={18} weight="bold" className="text-plum" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-crimson text-white text-[10px] font-extrabold grid place-items-center shadow-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Tags (Shown only when filters are active) */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pb-3 text-xs">
          <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px] mr-1">
            Active Filters:
          </span>
          {currentCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs text-plum font-semibold">
              Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button
                type="button"
                onClick={() => updateQuery({ category: "", subcategory: "" })}
                className="hover:text-crimson cursor-pointer ml-0.5"
                title="Remove category filter"
              >
                <X size={13} weight="bold" />
              </button>
            </span>
          )}
          {currentSubcategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs text-plum font-semibold">
              Subcategory: {currentSubcategory}
              <button
                type="button"
                onClick={() => updateQuery({ subcategory: "" })}
                className="hover:text-crimson cursor-pointer ml-0.5"
                title="Remove subcategory filter"
              >
                <X size={13} weight="bold" />
              </button>
            </span>
          )}
          {currentFabric && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs text-plum font-semibold">
              Fabric: {currentFabric}
              <button
                type="button"
                onClick={() => updateQuery({ fabric: "" })}
                className="hover:text-crimson cursor-pointer ml-0.5"
                title="Remove fabric filter"
              >
                <X size={13} weight="bold" />
              </button>
            </span>
          )}
          {currentSize && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs text-plum font-semibold">
              Size: {currentSize}
              <button
                type="button"
                onClick={() => updateQuery({ size: "" })}
                className="hover:text-crimson cursor-pointer ml-0.5"
                title="Remove size filter"
              >
                <X size={13} weight="bold" />
              </button>
            </span>
          )}
          {currentOccasion && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs text-plum font-semibold">
              Occasion: {currentOccasion}
              <button
                type="button"
                onClick={() => updateQuery({ occasion: "" })}
                className="hover:text-crimson cursor-pointer ml-0.5"
                title="Remove occasion filter"
              >
                <X size={13} weight="bold" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-crimson font-bold hover:underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mobile Sort Sheet */}
      <Sheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        title="Sort By"
      >
        <div className="p-4 space-y-1">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateQuery({ sort: opt.value });
                  setSortSheetOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  isSelected
                    ? "bg-plum-50 text-plum font-semibold"
                    : "text-ink hover:bg-blush"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={18} weight="bold" className="text-plum" />}
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* Filter Drawer / Sheet (Desktop & Mobile) */}
      <Sheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filters & Categories"
      >
        <div className="p-5 space-y-6 overflow-y-auto font-sans">
          {/* 1. Category Tab Buttons Group */}
          {categories && categories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <SquaresFour size={16} className="text-plum" weight="bold" />
                  <span>Category Collections</span>
                </h4>
                {currentCategory && (
                  <button
                    type="button"
                    onClick={() => updateQuery({ category: "", subcategory: "" })}
                    className="text-xs text-plum font-bold hover:underline cursor-pointer"
                  >
                    Reset Category
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateQuery({ category: "", subcategory: "" })}
                  className={`h-9 px-4 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    !currentCategory
                      ? "bg-plum text-white border-plum shadow-xs ring-2 ring-purple-200"
                      : "bg-[#fcf5f8] text-gray-800 border-[#f0dceb] hover:border-plum hover:bg-purple-50"
                  }`}
                >
                  All Items
                </button>
                {categories.map((cat) => {
                  const isSelected = currentCategory.toLowerCase() === cat.slug?.toLowerCase();
                  return (
                    <button
                      key={cat.slug || cat.id}
                      type="button"
                      onClick={() =>
                        updateQuery({ category: isSelected ? "" : cat.slug, subcategory: "" })
                      }
                      className={`h-9 px-4 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-plum text-white border-plum shadow-xs ring-2 ring-purple-200"
                          : "bg-[#fcf5f8] text-gray-800 border-[#f0dceb] hover:border-plum hover:bg-purple-50"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Sub-Category Tabs (if category selected and has subcategories) */}
          {(() => {
            const activeCatObj = categories.find(
              (c) => c.slug?.toLowerCase() === currentCategory?.toLowerCase()
            );
            let subcats = [];
            if (activeCatObj?.subcategories) {
              try {
                subcats = typeof activeCatObj.subcategories === "string"
                  ? JSON.parse(activeCatObj.subcategories)
                  : activeCatObj.subcategories;
              } catch (e) {
                subcats = [];
              }
            }
            if (!Array.isArray(subcats) || subcats.length === 0) return null;

            return (
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/70 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <Tag size={15} className="text-plum" weight="bold" />
                    <span>{activeCatObj.name} Sub-Categories</span>
                  </h4>
                  {currentSubcategory && (
                    <button
                      type="button"
                      onClick={() => updateQuery({ subcategory: "" })}
                      className="text-xs text-plum font-bold hover:underline cursor-pointer"
                    >
                      All {activeCatObj.name}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuery({ subcategory: "" })}
                    className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      !currentSubcategory
                        ? "bg-plum text-white border-plum shadow-2xs"
                        : "bg-white text-gray-700 border-gray-300 hover:border-plum"
                    }`}
                  >
                    All {activeCatObj.name}
                  </button>
                  {subcats.map((sub) => {
                    const subName = typeof sub === "string" ? sub : sub?.name || "";
                    if (!subName) return null;
                    const isSelected = currentSubcategory.toLowerCase() === subName.toLowerCase();
                    return (
                      <button
                        key={subName}
                        type="button"
                        onClick={() =>
                          updateQuery({ subcategory: isSelected ? "" : subName })
                        }
                        className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-plum text-white border-plum shadow-2xs"
                            : "bg-white text-gray-700 border-gray-300 hover:border-plum"
                        }`}
                      >
                        {subName}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 3. Sizes Group */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5">
              <span>Size Variants</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((sz) => {
                const isSelected = currentSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateQuery({ size: isSelected ? "" : sz })}
                    className={`h-9 min-w-[40px] px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-plum text-white border-plum shadow-xs ring-2 ring-purple-200"
                        : "bg-[#fcf5f8] text-gray-800 border-[#f0dceb] hover:border-plum hover:bg-purple-50"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Fabric Group */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5">
              <span>Fabric Type</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FABRICS.map((fab) => {
                const isSelected = currentFabric.toLowerCase() === fab.toLowerCase();
                return (
                  <button
                    key={fab}
                    type="button"
                    onClick={() => updateQuery({ fabric: isSelected ? "" : fab })}
                    className={`h-9 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-plum text-white border-plum shadow-xs ring-2 ring-purple-200"
                        : "bg-[#fcf5f8] text-gray-800 border-[#f0dceb] hover:border-plum hover:bg-purple-50"
                    }`}
                  >
                    {fab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Occasion Group */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5">
              <span>Occasion</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_OCCASIONS.map((occ) => {
                const isSelected = currentOccasion.toLowerCase() === occ.toLowerCase();
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => updateQuery({ occasion: isSelected ? "" : occ })}
                    className={`h-9 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-plum text-white border-plum shadow-xs ring-2 ring-purple-200"
                        : "bg-[#fcf5f8] text-gray-800 border-[#f0dceb] hover:border-plum hover:bg-purple-50"
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Sort By Selection inside Drawer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5">
              <ArrowsDownUp size={16} className="text-plum" weight="bold" />
              <span>Sort Order</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = currentSort === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateQuery({ sort: opt.value })}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-plum text-white border-plum shadow-xs"
                        : "bg-[#fcf5f8] text-gray-800 border-[#f0dceb] hover:border-plum hover:bg-purple-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} weight="bold" className="text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Sticky Actions */}
          <div className="pt-5 border-t border-gray-200 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1 h-11 text-xs font-bold"
            >
              Reset Filters
            </Button>
            <Button
              variant="action"
              onClick={() => setFilterSheetOpen(false)}
              className="flex-1 h-11 text-xs font-bold"
            >
              Show {totalCount} Items
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}

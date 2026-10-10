"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, SortAscending, X, Check } from "@phosphor-icons/react";
import Sheet from "@/components/Sheet";
import Button from "@/components/Button";
import Chip from "@/components/Chip";

const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Customer Rating", value: "rating" },
  { label: "Biggest Discount", value: "discount" },
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const AVAILABLE_FABRICS = [
  "Pure Silk",
  "Cambric Cotton",
  "Cotton Silk",
  "Rayon",
  "Georgette",
  "Chanderi",
  "Linen",
];
const AVAILABLE_OCCASIONS = ["Daily Wear", "Office", "Festive", "Party", "Bridal"];

export default function ShopFilters({ totalCount, categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
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
    // Reset page on filter change
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (currentCategory) params.set("category", currentCategory);
    router.push(`${pathname}?${params.toString()}`);
    setFilterSheetOpen(false);
    setSortSheetOpen(false);
  };

  const activeFiltersCount = [
    currentCategory,
    currentSize,
    currentFabric,
    currentOccasion,
  ].filter(Boolean).length;

  return (
    <>
      {/* Category Pills Header Row (Desktop Only) */}
      <div className="hidden lg:flex gap-2 overflow-x-auto no-scrollbar py-3">
        <button
          type="button"
          onClick={() => updateQuery({ category: "" })}
          className={`h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
            !currentCategory
              ? "bg-plum text-ivory border-plum"
              : "bg-blush text-ink border-line hover:border-plum"
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => {
          const isSelected = currentCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() =>
                updateQuery({ category: isSelected ? "" : cat.slug })
              }
              className={`h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                isSelected
                  ? "bg-plum text-ivory border-plum"
                  : "bg-blush text-ink border-line hover:border-plum"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Mobile Top Control Bar (Sort & Filter buttons in place of Category buttons) */}
      <div className="lg:hidden grid grid-cols-2 gap-3 py-2 my-2">
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

      {/* Desktop Top Control Bar (Sort Dropdown & Filter tags) */}
      <div className="hidden lg:flex items-center justify-between py-4 border-y border-line my-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-2">
            Active Filters:
          </span>
          {activeFiltersCount === 0 && (
            <span className="text-xs text-muted">None applied</span>
          )}
          {currentCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-50 border border-plum text-xs text-plum font-medium">
              Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button
                type="button"
                onClick={() => updateQuery({ category: "" })}
                className="hover:text-crimson cursor-pointer"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {currentFabric && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-50 border border-plum text-xs text-plum font-medium">
              Fabric: {currentFabric}
              <button
                type="button"
                onClick={() => updateQuery({ fabric: "" })}
                className="hover:text-crimson cursor-pointer"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {currentSize && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-50 border border-plum text-xs text-plum font-medium">
              Size: {currentSize}
              <button
                type="button"
                onClick={() => updateQuery({ size: "" })}
                className="hover:text-crimson cursor-pointer"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {currentOccasion && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-50 border border-plum text-xs text-plum font-medium">
              Occasion: {currentOccasion}
              <button
                type="button"
                onClick={() => updateQuery({ occasion: "" })}
                className="hover:text-crimson cursor-pointer"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-crimson font-medium hover:underline ml-2 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <label htmlFor="desktop-sort" className="text-xs text-muted font-medium">
            Sort by:
          </label>
          <select
            id="desktop-sort"
            value={currentSort}
            onChange={(e) => updateQuery({ sort: e.target.value })}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-ivory text-ink focus:outline-none focus:border-plum"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>



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

      {/* Mobile / Desktop Filter Sheet */}
      <Sheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filters"
      >
        <div className="p-4 space-y-6">
          {/* Category Group */}
          {categories && categories.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Category
              </h4>
              <div className="flex flex-wrap gap-2">
                <Chip
                  variant="filter"
                  selected={!currentCategory}
                  onClick={() => updateQuery({ category: "" })}
                >
                  All Items
                </Chip>
                {categories.map((cat) => {
                  const isSelected = currentCategory === cat.slug;
                  return (
                    <Chip
                      key={cat.slug}
                      variant="filter"
                      selected={isSelected}
                      onClick={() =>
                        updateQuery({ category: isSelected ? "" : cat.slug })
                      }
                    >
                      {cat.name}
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Group */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Size
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((sz) => {
                const isSelected = currentSize === sz;
                return (
                  <Chip
                    key={sz}
                    variant="size"
                    selected={isSelected}
                    onClick={() => updateQuery({ size: isSelected ? "" : sz })}
                  >
                    {sz}
                  </Chip>
                );
              })}
            </div>
          </div>

          {/* Fabric Group */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Fabric
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FABRICS.map((fab) => {
                const isSelected = currentFabric.toLowerCase() === fab.toLowerCase();
                return (
                  <Chip
                    key={fab}
                    variant="filter"
                    selected={isSelected}
                    onClick={() => updateQuery({ fabric: isSelected ? "" : fab })}
                  >
                    {fab}
                  </Chip>
                );
              })}
            </div>
          </div>

          {/* Occasion Group */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Occasion
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_OCCASIONS.map((occ) => {
                const isSelected = currentOccasion.toLowerCase() === occ.toLowerCase();
                return (
                  <Chip
                    key={occ}
                    variant="filter"
                    selected={isSelected}
                    onClick={() => updateQuery({ occasion: isSelected ? "" : occ })}
                  >
                    {occ}
                  </Chip>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-line flex gap-3">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              variant="action"
              onClick={() => setFilterSheetOpen(false)}
              className="flex-1"
            >
              Show {totalCount} Items
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}


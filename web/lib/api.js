/**
 * Agal Boutique API abstraction layer — synchronized with Node/Express/MySQL backend (server/).
 * Uses NEXT_PUBLIC_API_URL with automatic fallback to local data.
 */

import { products as localProducts } from "@/lib/data/products";
import { categories as localCategories } from "@/lib/data/categories";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Get products with optional filtering, sorting, and pagination
 */
export function getProducts(options = {}) {
  let filtered = [...localProducts];

  // Category filter
  if (options.category) {
    filtered = filtered.filter(
      (p) =>
        p.category.toLowerCase().replace(/\s+/g, "-") ===
        options.category.toLowerCase()
    );
  }

  // Search
  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Size filter
  if (options.sizes?.length) {
    filtered = filtered.filter((p) =>
      p.sizes.some((s) => options.sizes.includes(s.label) && s.stock > 0)
    );
  }

  // Fabric filter
  if (options.fabrics?.length) {
    filtered = filtered.filter((p) =>
      options.fabrics.some((f) =>
        p.fabric.toLowerCase().includes(f.toLowerCase())
      )
    );
  }

  // Occasion filter
  if (options.occasions?.length) {
    filtered = filtered.filter((p) =>
      p.occasion.some((o) => options.occasions.includes(o))
    );
  }

  // Price range
  if (options.minPrice != null) {
    filtered = filtered.filter((p) => p.price >= options.minPrice);
  }
  if (options.maxPrice != null) {
    filtered = filtered.filter((p) => p.price <= options.maxPrice);
  }

  // Sort
  const sort = options.sort || "newest";
  switch (sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => (b.rating?.avg || 0) - (a.rating?.avg || 0));
      break;
    case "discount":
      filtered.sort((a, b) => {
        const dA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
        const dB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
        return dB - dA;
      });
      break;
    case "newest":
    default:
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
  }

  // Pagination
  const page = Math.max(1, options.page || 1);
  const limit = options.limit || 12;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return { products: paged, total, page, totalPages };
}

/**
 * Fetch live products from Express/MySQL backend with fallback
 */
export async function fetchLiveProducts(queryStr = "") {
  try {
    const res = await fetch(`${API_URL}/products?${queryStr}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch products from backend");
    const data = await res.json();
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Get a single product by slug
 */
export function getProduct(slug) {
  return localProducts.find((p) => p.slug === slug) || null;
}

/**
 * Fetch a single product from backend by slug
 */
export async function fetchLiveProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Product not found");
    const data = await res.json();
    return data.product;
  } catch (err) {
    return getProduct(slug);
  }
}

/**
 * Submit order to backend server API
 */
export async function submitOrderToBackend(orderPayload) {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Backend order submission error:", err.message);
    return null;
  }
}

/**
 * Get all product slugs (for sitemap/static generation)
 */
export function getAllSlugs() {
  return localProducts.map((p) => ({ slug: p.slug }));
}

/**
 * Get all categories
 */
export function getCategories() {
  return localCategories;
}

/**
 * Get products similar to a given product
 */
export function getSimilarProducts(productId, limit = 4) {
  const product = localProducts.find((p) => p.id === productId);
  if (!product) return [];
  return localProducts
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, limit);
}

/**
 * Get unique fabrics across all products
 */
export function getAllFabrics() {
  const fabrics = new Set(localProducts.map((p) => p.fabric));
  return [...fabrics].sort();
}

/**
 * Get unique occasions across all products
 */
export function getAllOccasions() {
  const occasions = new Set(localProducts.flatMap((p) => p.occasion));
  return [...occasions].sort();
}

/**
 * API abstraction layer — reads from local data modules.
 * When a backend is added, swap these to fetch() calls. No page components need to change.
 */

import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";

/**
 * Get products with optional filtering, sorting, and pagination
 * @param {Object} options
 * @param {string} [options.category]
 * @param {string} [options.sort] - "price-asc" | "price-desc" | "newest" | "rating" | "discount"
 * @param {string} [options.search]
 * @param {string[]} [options.sizes]
 * @param {string[]} [options.fabrics]
 * @param {string[]} [options.occasions]
 * @param {number} [options.minPrice]
 * @param {number} [options.maxPrice]
 * @param {number} [options.page] - 1-indexed
 * @param {number} [options.limit] - items per page, default 12
 * @returns {{ products: Array, total: number, page: number, totalPages: number }}
 */
export function getProducts(options = {}) {
  let filtered = [...products];

  // Category filter
  if (options.category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase().replace(/\s+/g, "-") === options.category.toLowerCase()
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
      options.fabrics.some((f) => p.fabric.toLowerCase().includes(f.toLowerCase()))
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
 * Get a single product by slug
 * @param {string} slug
 * @returns {Object|null}
 */
export function getProduct(slug) {
  return products.find((p) => p.slug === slug) || null;
}

/**
 * Get all product slugs (for sitemap/static generation)
 * @returns {Array<{ slug: string, updatedAt?: string }>}
 */
export function getAllSlugs() {
  return products.map((p) => ({ slug: p.slug }));
}

/**
 * Get all categories
 * @returns {Array}
 */
export function getCategories() {
  return categories;
}

/**
 * Get products similar to a given product (same category, different product)
 * @param {string} productId
 * @param {number} limit
 * @returns {Array}
 */
export function getSimilarProducts(productId, limit = 4) {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return products
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, limit);
}

/**
 * Get unique fabrics across all products
 * @returns {string[]}
 */
export function getAllFabrics() {
  const fabrics = new Set(products.map((p) => p.fabric));
  return [...fabrics].sort();
}

/**
 * Get unique occasions across all products
 * @returns {string[]}
 */
export function getAllOccasions() {
  const occasions = new Set(products.flatMap((p) => p.occasion));
  return [...occasions].sort();
}


// Frontend API Client to communicate with Express/MySQL Backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper for standard JSON fetch with error handling & credentials
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Attach stored admin token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("agal_admin_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: options.credentials || "include",
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[API Fetch Warning] ${endpoint}:`, err.message);
    return { success: false, error: err.message };
  }
}

// 1. Products APIs
export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.append("category", params.category);
  if (params.search) query.append("search", params.search);
  if (params.sort) query.append("sort", params.sort);
  if (params.minPrice) query.append("minPrice", params.minPrice);
  if (params.maxPrice) query.append("maxPrice", params.maxPrice);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  const queryString = query.toString();
  return await apiFetch(`/products${queryString ? `?${queryString}` : ""}`);
}

export async function getProductBySlug(slug) {
  return await apiFetch(`/products/${slug}`);
}
export const getProduct = getProductBySlug;

export function getAllSlugs() {
  const { products } = require("@/lib/data/products");
  return products.map((p) => ({ slug: p.slug }));
}

export function getSimilarProducts(id, limit = 4) {
  const { products } = require("@/lib/data/products");
  return products.filter((p) => p.id !== id).slice(0, limit);
}

// 2. Categories APIs
export async function getCategories() {
  return await apiFetch("/categories");
}

// 3. CMS Settings APIs
export async function getCmsSettings() {
  return await apiFetch("/cms");
}

// 4. Orders API
export async function postOrder(orderPayload) {
  return await apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });
}
export const submitOrderToBackend = postOrder;

// 5. Admin Auth & Management APIs
export async function adminLogin(username, password) {
  return await apiFetch("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function adminGetMe() {
  return await apiFetch("/admin/me");
}

export async function adminGetStats() {
  return await apiFetch("/admin/stats");
}

export async function adminGetOrders() {
  return await apiFetch("/orders/all");
}

export async function adminUpdateOrderStatus(orderId, orderStatus, paymentStatus) {
  return await apiFetch(`/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ orderStatus, paymentStatus }),
  });
}

export async function adminDeleteOrder(orderId) {
  return await apiFetch(`/orders/${orderId}`, {
    method: "DELETE",
  });
}

export async function adminReturnOrder(orderId) {
  return await apiFetch(`/orders/${orderId}/return`, {
    method: "POST",
  });
}

export async function adminReplaceOrder(orderId, replacePayload) {
  return await apiFetch(`/orders/${orderId}/replace`, {
    method: "POST",
    body: JSON.stringify(replacePayload),
  });
}

export async function adminCreateProduct(productData) {
  return await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function adminUpdateProduct(id, productData) {
  return await apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function adminDeleteProduct(id) {
  return await apiFetch(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function adminBulkDeleteProducts(ids) {
  return await apiFetch("/products/bulk-delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function adminUpdateCmsSetting(key, value) {
  return await apiFetch("/cms/admin", {
    method: "PUT",
    body: JSON.stringify({ key, value }),
  });
}

export async function adminCreateCategory(categoryData) {
  return await apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

export async function adminUpdateCategory(id, categoryData) {
  return await apiFetch(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
}

export async function adminDeleteCategory(id) {
  return await apiFetch(`/categories/${id}`, {
    method: "DELETE",
  });
}

// 6. Cloudflare R2 Image Upload API
export async function adminUploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const url = `${API_BASE}/admin/upload`;
  const defaultHeaders = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("agal_admin_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      body: formData,
      credentials: "include",
    });
    return await res.json();
  } catch (err) {
    console.error("Image upload failed:", err);
    return { success: false, message: err.message };
  }
}

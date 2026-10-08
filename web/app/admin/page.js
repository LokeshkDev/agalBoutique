"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SignOut,
  House,
  Package,
  ShoppingBag,
  Sliders,
  Plus,
  Pencil,
  Trash,
  Clock,
  CurrencyInr,
  Eye,
  SquaresFour,
} from "@phosphor-icons/react";
import {
  adminLogin,
  adminGetStats,
  adminGetOrders,
  adminUpdateOrderStatus,
  getProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  getCmsSettings,
  adminUpdateCmsSetting,
} from "@/lib/api";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, cms, products, categories, orders

  // Login Form State
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("agalBout@2026");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data States
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalProducts: 0 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [cms, setCms] = useState({
    hero_banner: { title: "", subtitle: "", banner_url: "", button_text: "", button_link: "" },
    announcement_bar: { text: "", enabled: true },
    promo_banner: { title: "", subtitle: "", image_url: "", button_text: "", button_link: "" },
    store_info: { phone: "", whatsapp: "", email: "", address: "" },
  });

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    category: "Kurtis",
    price: "",
    mrp: "",
    fabric: "",
    description: "",
    imageUrl: "",
    isNew: false,
    isBestseller: false,
  });

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
  });

  const [cmsSaveStatus, setCmsSaveStatus] = useState("");

  // Check initial login state
  useEffect(() => {
    const token = localStorage.getItem("agal_admin_token");
    if (token) {
      setIsAuthenticated(true);
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    try {
      const statsRes = await adminGetStats();
      if (statsRes?.stats) setStats(statsRes.stats);

      const ordersRes = await adminGetOrders();
      if (ordersRes?.orders) setOrders(ordersRes.orders);

      const prodsRes = await getProducts({ limit: 100 });
      if (prodsRes?.products) setProducts(prodsRes.products);

      const catsRes = await getCategories();
      if (catsRes?.categories) setCategoriesList(catsRes.categories);

      const cmsRes = await getCmsSettings();
      if (cmsRes?.settings) setCms((prev) => ({ ...prev, ...cmsRes.settings }));
    } catch (e) {
      console.error("Error loading admin data:", e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const res = await adminLogin(username, password);
    setLoginLoading(false);

    if (res?.success) {
      localStorage.setItem("agal_admin_token", res.token || "admin_session");
      setIsAuthenticated(true);
      loadAllData();
    } else {
      setLoginError(res?.message || "Invalid admin credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("agal_admin_token");
    setIsAuthenticated(false);
  };

  // Product Actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      slug: "",
      category: categoriesList[0]?.name || "Kurtis",
      price: "",
      mrp: "",
      fabric: "",
      description: "",
      imageUrl: "",
      isNew: false,
      isBestseller: false,
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      slug: prod.slug || "",
      category: prod.category || "Kurtis",
      price: prod.price || "",
      mrp: prod.mrp || "",
      fabric: prod.fabric || "",
      description: prod.description || "",
      imageUrl: prod.images?.[0]?.url || "",
      isNew: Boolean(prod.isNew),
      isBestseller: Boolean(prod.isBestseller),
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: productForm.name,
      slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: productForm.category,
      price: parseFloat(productForm.price),
      mrp: productForm.mrp ? parseFloat(productForm.mrp) : null,
      fabric: productForm.fabric,
      description: productForm.description,
      images: productForm.imageUrl ? [{ url: productForm.imageUrl, alt: productForm.name }] : [],
      isNew: productForm.isNew,
      isBestseller: productForm.isBestseller,
    };

    if (editingProduct) {
      await adminUpdateProduct(editingProduct.id, payload);
    } else {
      await adminCreateProduct(payload);
    }

    setShowProductModal(false);
    loadAllData();
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product from DB?")) {
      await adminDeleteProduct(id);
      loadAllData();
    }
  };

  // Category Actions
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", image: "", description: "" });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || "",
      slug: cat.slug || "",
      image: cat.image || "",
      description: cat.description || "",
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      image: categoryForm.image,
      description: categoryForm.description,
    };

    if (editingCategory) {
      await adminUpdateCategory(editingCategory.id || editingCategory.slug, payload);
    } else {
      await adminCreateCategory(payload);
    }

    setShowCategoryModal(false);
    loadAllData();
  };

  const handleDeleteCategory = async (id) => {
    if (confirm("Are you sure you want to delete this category from DB?")) {
      await adminDeleteCategory(id);
      loadAllData();
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await adminUpdateOrderStatus(orderId, newStatus);
    loadAllData();
  };

  // CMS Actions
  const handleSaveCms = async (key, value) => {
    setCmsSaveStatus("Saving...");
    const res = await adminUpdateCmsSetting(key, value);
    if (res?.success) {
      setCmsSaveStatus("Settings saved successfully!");
      setTimeout(() => setCmsSaveStatus(""), 3000);
      loadAllData();
    } else {
      setCmsSaveStatus("Failed to save settings.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-3">
              <Image src="/logo.png" alt="Agal Boutique" width={140} height={48} className="h-10 w-auto mx-auto object-contain" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-xs text-gray-500 mt-1">Manage MySQL Products, Categories, Orders & CMS</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-11 bg-plum text-white font-bold rounded-lg hover:bg-plum-900 transition-colors shadow-md text-sm mt-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? "Authenticating..." : "Login to Admin Portal"}
            </button>
          </form>
          <div className="mt-6 text-center text-[11px] text-gray-400">
            Agal Boutique &copy; 2026 Admin Operations
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-16">
      {/* Admin Dedicated Header (No consumer store header/footer) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Agal Boutique" width={120} height={40} className="h-8 w-auto object-contain" />
            <span className="bg-plum/10 text-plum text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              ADMIN CONTROL PANEL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-xs text-gray-600 hover:text-plum flex items-center gap-1 font-semibold">
              <Eye size={16} />
              <span>View Live Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <SignOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <House size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "products" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Package size={18} />
            <span>Products DB ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "categories" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <SquaresFour size={18} />
            <span>Categories DB ({categoriesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "orders" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ShoppingBag size={18} />
            <span>Orders DB ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("cms")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "cms" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Sliders size={18} />
            <span>Homepage CMS</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
                  <CurrencyInr size={22} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
                <p className="text-[11px] text-gray-400 mt-1">From all confirmed orders in DB</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag size={22} className="text-plum" />
                </div>
                <div className="text-2xl font-black text-gray-900">{stats.totalOrders}</div>
                <p className="text-[11px] text-gray-400 mt-1">Database checkout count</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
                  <Clock size={22} className="text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">{stats.pendingOrders}</div>
                <p className="text-[11px] text-gray-400 mt-1">Requires shipping dispatch</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active DB Products</span>
                  <Package size={22} className="text-blue-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">{stats.totalProducts}</div>
                <p className="text-[11px] text-gray-400 mt-1">Live in store database</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <span>Recent Customer Orders</span>
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-plum font-semibold hover:underline">
                    View All &rarr;
                  </button>
                </h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No orders received in database yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                          <th className="py-2">Order #</th>
                          <th className="py-2">Customer</th>
                          <th className="py-2">Amount</th>
                          <th className="py-2">Payment</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.orderNumber || o.id}>
                            <td className="py-3 font-bold text-plum">{o.orderNumber}</td>
                            <td className="py-3">
                              <div className="font-semibold text-gray-900">{o.customerName}</div>
                              <div className="text-[11px] text-gray-400">{o.customerPhone}</div>
                            </td>
                            <td className="py-3 font-bold">₹{o.totalAmount}</td>
                            <td className="py-3 uppercase text-[10px] font-bold">
                              <span className={o.paymentMethod === "cod" ? "text-amber-700 bg-amber-50 px-2 py-0.5 rounded" : "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded"}>
                                {o.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="capitalize text-[11px] font-semibold text-gray-700">
                                {o.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Quick Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Quick DB Management</h3>
                <button
                  onClick={handleOpenNewProduct}
                  className="w-full py-2.5 bg-plum text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-plum-900 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Product to DB</span>
                </button>
                <button
                  onClick={handleOpenNewCategory}
                  className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Category to DB</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <h2 className="text-base font-bold text-gray-900">Database Products</h2>
                <p className="text-xs text-gray-500">Add, edit, or delete live boutique products in MySQL database.</p>
              </div>
              <button
                onClick={handleOpenNewProduct}
                className="px-4 py-2.5 bg-plum text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-plum-900 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price / MRP</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 italic text-xs">
                          No products in MySQL database. Click "Add Product" above to create your first item!
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.images?.[0]?.url || "/logo.png"}
                              alt={p.name}
                              className="w-10 h-12 object-cover rounded bg-gray-100 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-900">{p.name}</div>
                              <div className="text-[11px] text-gray-400">ID: {p.id}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-700">{p.category}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900">₹{p.price}</span>
                            {p.mrp && <span className="text-gray-400 line-through text-[11px] ml-1.5">₹{p.mrp}</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {p.isNew && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>}
                              {p.isBestseller && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">BESTSELLER</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-gray-600 hover:text-plum hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <h2 className="text-base font-bold text-gray-900">Database Categories</h2>
                <p className="text-xs text-gray-500">Manage categories, images, and descriptions displayed on frontend.</p>
              </div>
              <button
                onClick={handleOpenNewCategory}
                className="px-4 py-2.5 bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoriesList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 italic text-xs">
                          No categories in MySQL database. Click "Add Category" above to create one!
                        </td>
                      </tr>
                    ) : (
                      categoriesList.map((cat) => (
                        <tr key={cat.id || cat.slug} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-full shrink-0" />
                            ) : (
                              <div className="w-10 h-10 bg-plum/10 rounded-full flex items-center justify-center font-bold text-plum">
                                {cat.name?.[0]}
                              </div>
                            )}
                            <span className="font-bold text-gray-900">{cat.name}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-600 text-[11px]">{cat.slug}</td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{cat.description}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditCategory(cat)}
                                className="p-1.5 text-gray-600 hover:text-plum hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id || cat.slug)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h2 className="text-base font-bold text-gray-900">Database Customer Orders</h2>
              <p className="text-xs text-gray-500">View and update dispatch status for online and Cash on Delivery orders.</p>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500 text-sm">
                  No orders in MySQL database yet.
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.orderNumber || o.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-sm font-black text-plum mr-3">Order #{o.orderNumber}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          o.paymentMethod === "cod" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {o.paymentMethod} (₹{o.totalAmount})
                        </span>

                        <select
                          value={o.orderStatus || "confirmed"}
                          onChange={(e) => handleUpdateOrderStatus(o.orderNumber || o.id, e.target.value)}
                          className="h-8 px-2.5 text-xs font-bold border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-plum"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Customer Details</div>
                        <div className="font-bold text-gray-900">{o.customerName}</div>
                        <div className="text-gray-600">{o.customerPhone}</div>
                        <div className="text-gray-500">{o.customerEmail}</div>
                      </div>

                      <div>
                        <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Delivery Address</div>
                        <div className="text-gray-700 font-medium">
                          {o.shippingAddress?.line1}, {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pin}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Ordered Items</div>
                        <div className="space-y-1">
                          {o.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-gray-800">
                              <span>{item.name} ({item.size || "Free"}) × {item.qty}</span>
                              <span className="font-bold">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: HOMEPAGE CMS */}
        {activeTab === "cms" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Homepage CMS Settings</h2>
                <p className="text-xs text-gray-500">Update banner graphics, promo announcements, and store details live on website.</p>
              </div>
              {cmsSaveStatus && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-fade-in">
                  {cmsSaveStatus}
                </span>
              )}
            </div>

            {/* Hero Banner */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-plum border-l-4 border-plum pl-2">Hero Carousel Banner</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Banner Headline</label>
                  <input
                    type="text"
                    value={cms.hero_banner?.title || ""}
                    onChange={(e) => setCms({ ...cms, hero_banner: { ...cms.hero_banner, title: e.target.value } })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Banner Subtitle</label>
                  <input
                    type="text"
                    value={cms.hero_banner?.subtitle || ""}
                    onChange={(e) => setCms({ ...cms, hero_banner: { ...cms.hero_banner, subtitle: e.target.value } })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hero Image URL</label>
                  <input
                    type="text"
                    value={cms.hero_banner?.banner_url || ""}
                    onChange={(e) => setCms({ ...cms, hero_banner: { ...cms.hero_banner, banner_url: e.target.value } })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum font-mono"
                  />
                </div>
              </div>
              <button
                onClick={() => handleSaveCms("hero_banner", cms.hero_banner)}
                className="px-4 py-2 bg-plum text-white text-xs font-bold rounded-lg hover:bg-plum-900 transition-colors cursor-pointer"
              >
                Save Hero Banner
              </button>
            </div>

            {/* Announcement Bar */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-plum border-l-4 border-plum pl-2">Top Announcement Bar</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Announcement Text</label>
                <input
                  type="text"
                  value={cms.announcement_bar?.text || ""}
                  onChange={(e) => setCms({ ...cms, announcement_bar: { ...cms.announcement_bar, text: e.target.value } })}
                  className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                />
              </div>
              <button
                onClick={() => handleSaveCms("announcement_bar", cms.announcement_bar)}
                className="px-4 py-2 bg-plum text-white text-xs font-bold rounded-lg hover:bg-plum-900 transition-colors cursor-pointer"
              >
                Save Announcement Bar
              </button>
            </div>

            {/* Store Contact Info */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-plum border-l-4 border-plum pl-2">Store Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Support Number</label>
                  <input
                    type="text"
                    value={cms.store_info?.whatsapp || ""}
                    onChange={(e) => setCms({ ...cms, store_info: { ...cms.store_info, whatsapp: e.target.value } })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={cms.store_info?.email || ""}
                    onChange={(e) => setCms({ ...cms, store_info: { ...cms.store_info, email: e.target.value } })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  />
                </div>
              </div>
              <button
                onClick={() => handleSaveCms("store_info", cms.store_info)}
                className="px-4 py-2 bg-plum text-white text-xs font-bold rounded-lg hover:bg-plum-900 transition-colors cursor-pointer"
              >
                Save Contact Info
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              {editingProduct ? "Edit Product" : "Add Product to DB"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  placeholder="e.g. Handloom Silk Saree"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fabric</label>
                  <input
                    type="text"
                    value={productForm.fabric}
                    onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                    placeholder="e.g. 100% Kanchipuram Silk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                    placeholder="2999"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                    placeholder="4999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  placeholder="Detailed description of fabric, weave, and fit..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="w-4 h-4 rounded text-plum"
                  />
                  <span>Mark as New Arrival</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isBestseller}
                    onChange={(e) => setProductForm({ ...productForm, isBestseller: e.target.checked })}
                    className="w-4 h-4 rounded text-plum"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-plum text-white rounded-lg hover:bg-plum-900 transition-colors shadow-xs cursor-pointer"
                >
                  Save Product to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              {editingCategory ? "Edit Category" : "Add Category to DB"}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  placeholder="e.g. Sarees"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum font-mono"
                  placeholder="e.g. sarees"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category Image URL</label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  placeholder="1 sentence summary..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                >
                  Save Category to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

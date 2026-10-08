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
  MagnifyingGlass,
  Funnel,
  X,
  CheckSquare,
  Square,
} from "@phosphor-icons/react";
import ImageUploadInput from "@/components/ImageUploadInput";
import {
  adminLogin,
  adminGetStats,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  getProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminBulkDeleteProducts,
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
    ratingAvg: "4.6",
    ratingCount: "94",
    fabric: "",
    care: "Dry clean recommended for first wash",
    occasionStr: "Festive, Party Wear",
    colorsStr: "Gold, Red, Green",
    sizesList: [
      { label: "34", stock: 10 },
      { label: "36", stock: 5 },
      { label: "38", stock: 8 },
      { label: "40", stock: 2 },
    ],
    description: "",
    imageUrl: "",
    imagesList: ["", "", ""],
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

  // Product Search, Filter, Bulk Select & View Modal States
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [badgeFilter, setBadgeFilter] = useState("All");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Order Management States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Check initial login state & set up real-time orders polling (sync frontend orders)
  useEffect(() => {
    const token = localStorage.getItem("agal_admin_token");
    if (token) {
      setIsAuthenticated(true);
      loadAllData();

      // Automatically sync incoming frontend orders & stats every 8 seconds
      const pollTimer = setInterval(() => {
        adminGetOrders().then((res) => {
          if (res?.orders) setOrders(res.orders);
        });
        adminGetStats().then((res) => {
          if (res?.stats) setStats(res.stats);
        });
      }, 8000);

      return () => clearInterval(pollTimer);
    }
  }, []);

  const loadAllData = async () => {
    try {
      const statsRes = await adminGetStats();
      if (statsRes?.stats) setStats(statsRes.stats);

      const ordersRes = await adminGetOrders();
      if (ordersRes?.orders) setOrders(ordersRes.orders);

      const prodsRes = await getProducts({ limit: 200 });
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
      ratingAvg: "4.6",
      ratingCount: "94",
      fabric: "Brocade Silk & Cotton Lining",
      care: "Dry clean recommended for first wash",
      occasionStr: "Festive, Party Wear",
      colorsStr: "Gold, Red, Green",
      sizesList: [
        { label: "34", stock: 10 },
        { label: "36", stock: 5 },
        { label: "38", stock: 8 },
        { label: "40", stock: 2 },
      ],
      description: "",
      imageUrl: "",
      imagesList: ["", "", ""],
      isNew: false,
      isBestseller: false,
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    const existingImages = (prod.images || []).map((img) => (typeof img === "string" ? img : img.url));
    const mainImg = existingImages[0] || "";
    const extraImgs = [existingImages[1] || "", existingImages[2] || "", existingImages[3] || ""];

    setProductForm({
      name: prod.name || "",
      slug: prod.slug || "",
      category: prod.category || "Kurtis",
      price: prod.price || "",
      mrp: prod.mrp || "",
      ratingAvg: String(prod.rating?.avg || "4.6"),
      ratingCount: String(prod.rating?.count || "94"),
      fabric: prod.fabric || "",
      care: prod.care || "Dry clean recommended for first wash",
      occasionStr: Array.isArray(prod.occasion) ? prod.occasion.join(", ") : prod.occasion || "Festive, Party Wear",
      colorsStr: Array.isArray(prod.colors) ? prod.colors.join(", ") : prod.colors || "Gold, Red, Green",
      sizesList: Array.isArray(prod.sizes) && prod.sizes.length > 0
        ? prod.sizes.map((s) => (typeof s === "object" ? s : { label: String(s), stock: 10 }))
        : [
            { label: "34", stock: 10 },
            { label: "36", stock: 5 },
            { label: "38", stock: 8 },
            { label: "40", stock: 2 },
          ],
      description: prod.description || "",
      imageUrl: mainImg,
      imagesList: extraImgs,
      isNew: Boolean(prod.isNew),
      isBestseller: Boolean(prod.isBestseller),
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // Prepare full image gallery array
    const allImages = [];
    if (productForm.imageUrl.trim()) {
      allImages.push({ url: productForm.imageUrl.trim(), alt: productForm.name });
    }
    productForm.imagesList.forEach((url) => {
      if (url && url.trim()) {
        allImages.push({ url: url.trim(), alt: productForm.name });
      }
    });

    // Parse occasions & colors arrays from comma-separated string
    const parsedOccasions = productForm.occasionStr
      ? productForm.occasionStr.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Festive"];

    const parsedColors = productForm.colorsStr
      ? productForm.colorsStr.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Gold", "Red", "Green"];

    const payload = {
      name: productForm.name,
      slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: productForm.category,
      price: parseFloat(productForm.price),
      mrp: productForm.mrp ? parseFloat(productForm.mrp) : null,
      ratingAvg: parseFloat(productForm.ratingAvg || "4.6"),
      ratingCount: parseInt(productForm.ratingCount || "94", 10),
      fabric: productForm.fabric,
      care: productForm.care,
      occasion: parsedOccasions,
      colors: parsedColors,
      sizes: productForm.sizesList,
      description: productForm.description,
      images: allImages,
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

  // Filter & Search product items
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !productSearch.trim() ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      String(p.id).toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.fabric?.toLowerCase().includes(productSearch.toLowerCase());

    const matchCategory =
      categoryFilter === "All" ||
      p.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchBadge =
      badgeFilter === "All" ||
      (badgeFilter === "new" && p.isNew) ||
      (badgeFilter === "bestseller" && p.isBestseller);

    return matchSearch && matchCategory && matchBadge;
  });

  // Bulk selection functions
  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelectProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products from DB?`)) {
      await adminBulkDeleteProducts(selectedProductIds);
      setSelectedProductIds([]);
      loadAllData();
    }
  };

  // Quick View Function
  const handleOpenViewProduct = (p) => {
    setViewingProduct(p);
    setShowViewModal(true);
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

  // Order Actions & Filtering
  const handleUpdateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    await adminUpdateOrderStatus(orderId, orderStatus, paymentStatus);
    loadAllData();
    if (viewingOrder && (viewingOrder.orderNumber === orderId || String(viewingOrder.id) === String(orderId))) {
      setViewingOrder((prev) => ({
        ...prev,
        orderStatus: orderStatus || prev.orderStatus,
        paymentStatus: paymentStatus || prev.paymentStatus,
      }));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (confirm(`Are you sure you want to delete Order #${orderId} permanently from database?`)) {
      await adminDeleteOrder(orderId);
      if (viewingOrder?.orderNumber === orderId || String(viewingOrder?.id) === String(orderId)) {
        setShowOrderModal(false);
        setViewingOrder(null);
      }
      loadAllData();
    }
  };

  const handleOpenOrderDetails = (order) => {
    setViewingOrder(order);
    setShowOrderModal(true);
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !orderSearch.trim() ||
      o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(orderSearch.toLowerCase());

    const matchStatus =
      orderStatusFilter === "All" ||
      o.orderStatus?.toLowerCase() === orderStatusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

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
            {/* Header + Search + Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Database Products ({filteredProducts.length})</h2>
                  <p className="text-xs text-gray-500">Search, filter, view, edit, or bulk delete products in MySQL database.</p>
                </div>
                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2.5 bg-plum text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-plum-900 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Search & Filter Inputs Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlass size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, ID, fabric..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Funnel size={16} className="text-gray-400 shrink-0" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum bg-white"
                  >
                    <option value="All">All Categories</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Badge Filter */}
                <div>
                  <select
                    value={badgeFilter}
                    onChange={(e) => setBadgeFilter(e.target.value)}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum bg-white"
                  >
                    <option value="All">All Badges</option>
                    <option value="new">New Arrivals Only</option>
                    <option value="bestseller">Bestsellers Only</option>
                  </select>
                </div>
              </div>

              {/* Bulk Delete Bar (Appears when items are selected) */}
              {selectedProductIds.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in text-xs">
                  <span className="font-bold text-red-800">
                    {selectedProductIds.length} {selectedProductIds.length === 1 ? "product" : "products"} selected for bulk action
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="px-3 py-1.5 text-gray-600 hover:bg-red-100 rounded-md font-semibold cursor-pointer"
                    >
                      Cancel Selection
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Trash size={14} />
                      <span>Bulk Delete ({selectedProductIds.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Products Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredProducts.length > 0 &&
                            selectedProductIds.length === filteredProducts.length
                          }
                          onChange={handleSelectAllProducts}
                          className="w-4 h-4 rounded text-plum cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price / MRP</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 italic text-xs">
                          No matching products found. Try adjusting your search or filters!
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <tr
                            key={p.id}
                            className={`transition-colors ${
                              isSelected ? "bg-plum/5" : "hover:bg-gray-50/80"
                            }`}
                          >
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectProduct(p.id)}
                                className="w-4 h-4 rounded text-plum cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={p.images?.[0]?.url || "/logo.png"}
                                alt={p.name}
                                className="w-10 h-12 object-cover rounded bg-gray-100 shrink-0 border border-gray-200"
                              />
                              <div>
                                <div className="font-bold text-gray-900">{p.name}</div>
                                <div className="text-[11px] text-gray-400 font-mono">ID: {p.id}</div>
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
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenViewProduct(p)}
                                  className="p-1.5 text-gray-600 hover:text-plum hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                  title="Quick View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 text-gray-600 hover:text-plum hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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

        {/* TAB 4: ORDERS MANAGEMENT (FULL CRUD & SEARCH) */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Header + Search + Status Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Database Customer Orders ({filteredOrders.length})</h2>
                  <p className="text-xs text-gray-500">Live order sync from frontend checkout. Filter, inspect items, update status, or delete.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlass size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order #, customer name, phone, email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch("")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Funnel size={16} className="text-gray-400 shrink-0" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum bg-white"
                  >
                    <option value="All">All Dispatch Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500 text-xs italic">
                  No matching orders found in database.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div key={o.orderNumber || o.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-xs hover:border-plum/30 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-plum">Order #{o.orderNumber}</span>
                        <span className="text-xs text-gray-400 font-mono">
                          {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          o.paymentMethod === "cod" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {o.paymentMethod} (₹{o.totalAmount})
                        </span>

                        <select
                          value={o.orderStatus || "confirmed"}
                          onChange={(e) => handleUpdateOrderStatus(o.orderNumber || o.id, e.target.value, o.paymentStatus)}
                          className="h-8 px-2.5 text-xs font-bold border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-plum cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => handleOpenOrderDetails(o)}
                          className="p-1.5 text-gray-600 hover:text-plum hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="View Full Order Details"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(o.orderNumber || o.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Order Record"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const cName = o.customerName || o.customer_name || o.shippingAddress?.name || "Boutique Customer";
                      const cPhone = o.customerPhone || o.customer_phone || o.shippingAddress?.phone || "";
                      const cEmail = o.customerEmail || o.customer_email || o.shippingAddress?.email || "";
                      const sLine1 = o.shippingAddress?.line1 || o.shipping_address?.line1 || o.shippingAddress?.address || "";
                      const sCity = o.shippingAddress?.city || o.shipping_address?.city || "";
                      const sState = o.shippingAddress?.state || o.shipping_address?.state || "";
                      const sPin = o.shippingAddress?.pin || o.shipping_address?.pin || o.shippingAddress?.pincode || "";
                      const sTag = o.shippingAddress?.tag || o.shipping_address?.tag || "Home";

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Customer Details</div>
                            <div className="font-bold text-gray-900">{cName}</div>
                            <div className="text-gray-600">{cPhone ? `+91 ${cPhone}` : ""}</div>
                            <div className="text-gray-500">{cEmail}</div>
                          </div>

                          <div>
                            <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Delivery Address</div>
                            <div className="text-gray-700 font-medium">
                              {sLine1 ? `${sLine1}, ` : ""}{sCity ? `${sCity}, ` : ""}{sState ? `${sState} - ` : ""}<strong>{sPin}</strong> ({sTag})
                            </div>
                          </div>

                          <div>
                            <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wider text-[10px]">Items Summary ({o.items?.length || 0})</div>
                            <div className="space-y-1">
                              {o.items?.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-gray-800">
                                  <span className="truncate max-w-[180px]">{item.name} ({item.size || "Free"}) × {item.qty}</span>
                                  <span className="font-bold">₹{item.price * item.qty}</span>
                                </div>
                              ))}
                              {o.items?.length > 3 && (
                                <div className="text-[11px] text-plum font-semibold cursor-pointer hover:underline" onClick={() => handleOpenOrderDetails(o)}>
                                  + {o.items.length - 3} more items...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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

            {/* Hero Carousel Slides Manager */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-plum border-l-4 border-plum pl-2">Hero Carousel Banners (Database)</h3>
                <button
                  onClick={() => {
                    const newSlides = [
                      ...(cms.hero_slides || []),
                      {
                        id: Date.now(),
                        title: "New Festive Collection",
                        subtitle: "Handcrafted boutique styles",
                        offer: "Flat 15% OFF",
                        link: "/shop",
                        cta: "Shop Edit",
                        badge: "Exclusive",
                        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
                      },
                    ];
                    setCms({ ...cms, hero_slides: newSlides });
                  }}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Add Slide
                </button>
              </div>

              <div className="space-y-4">
                {(cms.hero_slides || []).map((slide, idx) => (
                  <div key={slide.id || idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold text-plum">Slide #{idx + 1}</span>
                      <button
                        onClick={() => {
                          const updated = (cms.hero_slides || []).filter((_, i) => i !== idx);
                          setCms({ ...cms, hero_slides: updated });
                          handleSaveCms("hero_slides", updated);
                        }}
                        className="text-xs text-red-600 hover:bg-red-50 p-1 rounded font-bold cursor-pointer"
                      >
                        Delete Slide
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Headline Title</label>
                        <input
                          type="text"
                          value={slide.title || ""}
                          onChange={(e) => {
                            const updated = [...(cms.hero_slides || [])];
                            updated[idx].title = e.target.value;
                            setCms({ ...cms, hero_slides: updated });
                          }}
                          className="w-full h-9 px-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Subtitle Description</label>
                        <input
                          type="text"
                          value={slide.subtitle || ""}
                          onChange={(e) => {
                            const updated = [...(cms.hero_slides || [])];
                            updated[idx].subtitle = e.target.value;
                            setCms({ ...cms, hero_slides: updated });
                          }}
                          className="w-full h-9 px-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Offer Badge / Code Line</label>
                        <input
                          type="text"
                          value={slide.offer || ""}
                          onChange={(e) => {
                            const updated = [...(cms.hero_slides || [])];
                            updated[idx].offer = e.target.value;
                            setCms({ ...cms, hero_slides: updated });
                          }}
                          className="w-full h-9 px-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Target Link URL</label>
                        <input
                          type="text"
                          value={slide.link || ""}
                          onChange={(e) => {
                            const updated = [...(cms.hero_slides || [])];
                            updated[idx].link = e.target.value;
                            setCms({ ...cms, hero_slides: updated });
                          }}
                          className="w-full h-9 px-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <ImageUploadInput
                          label="Banner Image (Cloudflare R2 + WebP Optimized)"
                          value={slide.image || slide.banner_url || ""}
                          onChange={(url) => {
                            const updated = [...(cms.hero_slides || [])];
                            updated[idx].image = url;
                            updated[idx].banner_url = url;
                            setCms({ ...cms, hero_slides: updated });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSaveCms("hero_slides", cms.hero_slides)}
                className="px-4 py-2 bg-plum text-white text-xs font-bold rounded-lg hover:bg-plum-900 transition-colors cursor-pointer shadow-xs"
              >
                Save All Hero Slides to DB
              </button>
            </div>

            {/* Top Announcement Bar */}
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

      {/* ADD / EDIT PRODUCT MODAL (FULL SCREEN EXPANDED VIEW) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6">
          <div className="bg-white max-w-6xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[96vh] overflow-y-auto relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product to MySQL Database"}
                </h3>
                <p className="text-xs text-gray-500">Configure catalog details, R2 WebP images, color swatches, and size inventory.</p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: Basic Info, Category, Pricing, Specs, Description */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-plum uppercase tracking-wider border-b border-gray-100 pb-1">
                    Basic Info & Pricing
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                      placeholder="e.g. Kanchipuram Pure Silk Saree"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum bg-white"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat.id || cat.slug} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Fabric Details</label>
                      <input
                        type="text"
                        value={productForm.fabric}
                        onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                        className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        placeholder="e.g. Brocade Silk & Cotton Lining"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Rating Average (1-5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={productForm.ratingAvg}
                        onChange={(e) => setProductForm({ ...productForm, ratingAvg: e.target.value })}
                        className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        placeholder="4.6"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Verified Review Count</label>
                      <input
                        type="number"
                        value={productForm.ratingCount}
                        onChange={(e) => setProductForm({ ...productForm, ratingCount: e.target.value })}
                        className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        placeholder="94"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Care & Wash Instructions</label>
                    <input
                      type="text"
                      value={productForm.care}
                      onChange={(e) => setProductForm({ ...productForm, care: e.target.value })}
                      className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                      placeholder="Dry clean recommended for first wash"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Product Description</label>
                    <textarea
                      rows={4}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full p-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                      placeholder="Detailed description of weave, fabric weight, and fit..."
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1">
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
                </div>

                {/* RIGHT COLUMN: Swatches, Sizes & Stock, Images Gallery */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-plum uppercase tracking-wider border-b border-gray-100 pb-1">
                    Variants & Media Gallery
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Color Swatches (comma separated)</label>
                      <input
                        type="text"
                        value={productForm.colorsStr}
                        onChange={(e) => setProductForm({ ...productForm, colorsStr: e.target.value })}
                        className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        placeholder="Gold, Red, Green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Occasions (comma separated)</label>
                      <input
                        type="text"
                        value={productForm.occasionStr}
                        onChange={(e) => setProductForm({ ...productForm, occasionStr: e.target.value })}
                        className="w-full h-10 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-plum"
                        placeholder="Festive, Party Wear"
                      />
                    </div>
                  </div>

                  {/* Sizes and Stock Management */}
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800">Sizes & Inventory Stock</label>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            sizesList: [...productForm.sizesList, { label: "42", stock: 5 }],
                          })
                        }
                        className="text-xs font-bold text-plum hover:underline"
                      >
                        + Add Size Variant
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {productForm.sizesList.map((sz, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Size Label (e.g. 34)"
                            value={sz.label}
                            onChange={(e) => {
                              const updated = [...productForm.sizesList];
                              updated[sIdx].label = e.target.value;
                              setProductForm({ ...productForm, sizesList: updated });
                            }}
                            className="w-1/2 h-8 px-2 text-xs border border-gray-300 rounded bg-white"
                          />
                          <input
                            type="number"
                            placeholder="Stock Qty"
                            value={sz.stock}
                            onChange={(e) => {
                              const updated = [...productForm.sizesList];
                              updated[sIdx].stock = parseInt(e.target.value || "0", 10);
                              setProductForm({ ...productForm, sizesList: updated });
                            }}
                            className="w-1/2 h-8 px-2 text-xs border border-gray-300 rounded bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = productForm.sizesList.filter((_, i) => i !== sIdx);
                              setProductForm({ ...productForm, sizesList: updated });
                            }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded font-bold text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Image Upload */}
                  <ImageUploadInput
                    label="Main Cover Image (Cloudflare R2 + WebP)"
                    value={productForm.imageUrl}
                    onChange={(url) => setProductForm({ ...productForm, imageUrl: url })}
                  />

                  {/* Gallery Images Upload */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-gray-800">Additional Gallery Images (Cloudflare R2)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {productForm.imagesList.map((imgUrl, gIdx) => (
                        <ImageUploadInput
                          key={gIdx}
                          label={`Gallery #${gIdx + 2}`}
                          value={imgUrl}
                          onChange={(url) => {
                            const updated = [...productForm.imagesList];
                            updated[gIdx] = url;
                            setProductForm({ ...productForm, imagesList: updated });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-plum text-white rounded-lg hover:bg-plum-900 transition-colors shadow-sm cursor-pointer"
                >
                  Save Product to Database
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

              <ImageUploadInput
                label="Category Display Image (Cloudflare R2 + WebP Optimized)"
                value={categoryForm.image}
                onChange={(url) => setCategoryForm({ ...categoryForm, image: url })}
              />

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

      {/* PRODUCT QUICK VIEW DETAILS MODAL */}
      {showViewModal && viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="bg-plum/10 text-plum font-bold text-xs px-2.5 py-0.5 rounded-full uppercase">
                {viewingProduct.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {viewingProduct.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Gallery Images Preview */}
              <div className="space-y-3">
                <img
                  src={viewingProduct.images?.[0]?.url || "/logo.png"}
                  alt={viewingProduct.name}
                  className="w-full h-64 object-cover rounded-xl border border-gray-200 shadow-xs"
                />
                {viewingProduct.images?.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={typeof img === "string" ? img : img.url}
                        alt={`Gallery ${i + 1}`}
                        className="w-14 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Summary */}
              <div className="space-y-3 text-xs">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{viewingProduct.name}</h3>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-gray-900">₹{viewingProduct.price}</span>
                    {viewingProduct.mrp && (
                      <span className="text-xs text-gray-400 line-through ml-2">₹{viewingProduct.mrp}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Rating: {viewingProduct.rating?.avg || "4.6"} ★ ({viewingProduct.rating?.count || "94"})
                  </span>
                </div>

                {viewingProduct.fabric && (
                  <div>
                    <strong className="text-gray-900 block font-semibold mb-0.5">Fabric Details:</strong>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">{viewingProduct.fabric}</p>
                  </div>
                )}

                {viewingProduct.care && (
                  <div>
                    <strong className="text-gray-900 block font-semibold mb-0.5">Care Instructions:</strong>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">{viewingProduct.care}</p>
                  </div>
                )}

                {/* Colors */}
                {viewingProduct.colors?.length > 0 && (
                  <div>
                    <strong className="text-gray-900 block font-semibold mb-1">Color Options:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingProduct.colors.map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-medium border border-gray-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes & Stock */}
                {viewingProduct.sizes?.length > 0 && (
                  <div>
                    <strong className="text-gray-900 block font-semibold mb-1">Sizes & Stock Levels:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingProduct.sizes.map((s, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                            s.stock > 0
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-600 border-red-200 line-through"
                          }`}
                        >
                          {typeof s === "object" ? `${s.label} (${s.stock} in stock)` : s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingProduct.description && (
                  <div>
                    <strong className="text-gray-900 block font-semibold mb-0.5">Description:</strong>
                    <p className="text-gray-600 leading-relaxed max-h-24 overflow-y-auto">{viewingProduct.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenEditProduct(viewingProduct);
                }}
                className="px-4 py-2 text-xs font-bold bg-plum text-white rounded-lg hover:bg-plum-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Pencil size={15} /> Edit Product
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER FULL DETAILS MODAL (CRUD OPERATIONS) */}
      {showOrderModal && viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[94vh] overflow-y-auto relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-xs font-mono text-gray-400">Order ID: {viewingOrder.id || viewingOrder.orderNumber}</span>
                <h3 className="text-lg font-black text-plum">Order #{viewingOrder.orderNumber}</h3>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" })}
                </p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Controls */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Dispatch Order Status</label>
                <select
                  value={viewingOrder.orderStatus || "confirmed"}
                  onChange={(e) => handleUpdateOrderStatus(viewingOrder.orderNumber || viewingOrder.id, e.target.value, viewingOrder.paymentStatus)}
                  className="w-full h-10 px-3 font-bold border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-plum"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Status</label>
                <select
                  value={viewingOrder.paymentStatus || (viewingOrder.paymentMethod === "cod" ? "pending" : "paid")}
                  onChange={(e) => handleUpdateOrderStatus(viewingOrder.orderNumber || viewingOrder.id, viewingOrder.orderStatus, e.target.value)}
                  className="w-full h-10 px-3 font-bold border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-plum"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Customer & Address Details Grid */}
            {(() => {
              const cName = viewingOrder.customerName || viewingOrder.customer_name || viewingOrder.shippingAddress?.name || "Boutique Customer";
              const cPhone = viewingOrder.customerPhone || viewingOrder.customer_phone || viewingOrder.shippingAddress?.phone || "";
              const cEmail = viewingOrder.customerEmail || viewingOrder.customer_email || viewingOrder.shippingAddress?.email || "";
              const sLine1 = viewingOrder.shippingAddress?.line1 || viewingOrder.shipping_address?.line1 || viewingOrder.shippingAddress?.address || "";
              const sCity = viewingOrder.shippingAddress?.city || viewingOrder.shipping_address?.city || "";
              const sState = viewingOrder.shippingAddress?.state || viewingOrder.shipping_address?.state || "";
              const sPin = viewingOrder.shippingAddress?.pin || viewingOrder.shipping_address?.pin || viewingOrder.shippingAddress?.pincode || "";
              const sTag = viewingOrder.shippingAddress?.tag || viewingOrder.shipping_address?.tag || "Home";

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider text-plum border-b border-gray-100 pb-1">
                      Customer & Contact Info
                    </h4>
                    <div className="space-y-1">
                      <p><strong className="text-gray-900">Name:</strong> {cName}</p>
                      <p><strong className="text-gray-900">Phone:</strong> {cPhone ? `+91 ${cPhone}` : "N/A"}</p>
                      <p><strong className="text-gray-900">Email:</strong> {cEmail || "N/A"}</p>
                    </div>
                    {cPhone && (
                      <a
                        href={`https://wa.me/91${cPhone}?text=Hello%20${encodeURIComponent(cName)},%20regarding%20your%20Agal%20Boutique%20order%20${viewingOrder.orderNumber}...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors mt-2 cursor-pointer shadow-xs"
                      >
                        Chat on WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider text-plum border-b border-gray-100 pb-1">
                      Shipping Delivery Address
                    </h4>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {sLine1 ? `${sLine1}, ` : ""}{sCity ? `${sCity}, ` : ""}{sState ? `${sState} - ` : ""}<strong>{sPin}</strong><br />
                      <span className="inline-block mt-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase">
                        Address Tag: {sTag}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Line Items Table with Custom Stitching Specs */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider text-plum">
                Itemized Order Summary ({viewingOrder.items?.length || 0})
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-3">Size / Color</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewingOrder.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image || item.images?.[0]?.url || "/logo.png"}
                              alt={item.name}
                              className="w-10 h-12 object-cover rounded border border-gray-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-900">{item.name}</div>
                              <div className="text-[11px] text-gray-400 font-mono">₹{item.price} each</div>
                              {/* Render Custom Stitching Details if attached by customer */}
                              {item.customStitching && (
                                <div className="mt-1 p-2 bg-purple-50 border border-purple-200 rounded text-[11px] text-purple-900 space-y-0.5">
                                  <div className="font-bold">✂️ Custom Stitching Specs:</div>
                                  <div>Bust: {item.customStitching.bust || "N/A"} in | Waist: {item.customStitching.waist || "N/A"} in</div>
                                  <div>Pattern: {item.customStitching.neckType || "Standard"}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-700">
                          <div>Size: <strong>{item.size || "Free"}</strong></div>
                          {item.color && <div className="text-gray-500 text-[11px]">Color: {item.color}</div>}
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900">{item.qty}</td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900">₹{item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Pricing Calculation */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span>₹{viewingOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Delivery Fee:</span>
                <span>{viewingOrder.shippingFee === 0 ? "FREE" : `₹${viewingOrder.shippingFee}`}</span>
              </div>
              {viewingOrder.codFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Cash on Delivery Handling Fee:</span>
                  <span>₹{viewingOrder.codFee}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-plum pt-2 border-t border-gray-200">
                <span>Grand Total Amount:</span>
                <span>₹{viewingOrder.totalAmount}</span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <button
                onClick={() => handleDeleteOrder(viewingOrder.orderNumber || viewingOrder.id)}
                className="px-4 py-2 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash size={16} /> Delete Order Record
              </button>

              <button
                onClick={() => setShowOrderModal(false)}
                className="px-5 py-2 text-xs font-bold bg-plum text-white hover:bg-plum-900 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

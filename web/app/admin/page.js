"use client";

import React, { useState, useEffect, Fragment } from "react";
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
  Copy,
  CaretLeft,
  CaretRight,
  CaretDown,
  List,
  ArrowUDownLeft,
  ArrowsClockwise,
  Gear,
  Truck,
  FolderPlus,
  Megaphone,
  BookOpen,
  PhoneCall,
  ImageSquare,
  NavigationArrow,
  Sparkle,
  Phone,
  Info,
  CreditCard,
  Money,
  CheckCircle,
  WhatsappLogo,
  FileText,
  Printer,
} from "@phosphor-icons/react";
import ImageUploadInput from "@/components/ImageUploadInput";
import {
  adminLogin,
  adminGetStats,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminReturnOrder,
  adminReplaceOrder,
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
  sendOrderInvoice,
  normalizeImageUrl,
} from "@/lib/api";

function SalesAnalyticsChart({ orders = [] }) {
  const [chartView, setChartView] = useState("revenue"); // "revenue" or "status"
  const [timeframe, setTimeframe] = useState("daily"); // daily, weekly, monthly, yearly

  // 1. Calculate Real-time Status Data across all database orders
  const totalOrdersCount = orders.length || 1;

  const statusConfigs = [
    {
      id: "shipped",
      label: "Shipped",
      icon: "🚚",
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      filterFn: (o) => (o.orderStatus || "").toLowerCase() === "shipped",
    },
    {
      id: "delivered",
      label: "Delivered",
      icon: "📦",
      color: "from-emerald-600 to-teal-600",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      filterFn: (o) => (o.orderStatus || "").toLowerCase() === "delivered",
    },
    {
      id: "confirmed",
      label: "Confirmed",
      icon: "✅",
      color: "from-plum to-purple-800",
      textColor: "text-plum",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      filterFn: (o) => (o.orderStatus || "").toLowerCase() === "confirmed",
    },
    {
      id: "pending",
      label: "Pending",
      icon: "⏳",
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      filterFn: (o) => (o.orderStatus || "").toLowerCase() === "pending",
    },
    {
      id: "returned",
      label: "Returned",
      icon: "↩️",
      color: "from-rose-600 to-red-600",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      filterFn: (o) =>
        (o.orderStatus || "").toLowerCase() === "returned" ||
        (Array.isArray(o.returnHistory) && o.returnHistory.length > 0) ||
        (Array.isArray(o.return_history) && o.return_history.length > 0),
    },
    {
      id: "replaced",
      label: "Replaced",
      icon: "🔄",
      color: "from-purple-600 to-fuchsia-600",
      textColor: "text-purple-700",
      bgColor: "bg-fuchsia-50",
      borderColor: "border-fuchsia-200",
      filterFn: (o) => (o.orderStatus || "").toLowerCase() === "replaced",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: "❌",
      color: "from-gray-500 to-gray-700",
      textColor: "text-gray-700",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      filterFn: (o) => (o.orderStatus || "").toLowerCase() === "cancelled",
    },
  ];

  const statusMetrics = statusConfigs.map((cfg) => {
    const matchedOrders = orders.filter(cfg.filterFn);
    const count = matchedOrders.length;
    const revenue = matchedOrders.reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount || o.total_amount || 0) || 0),
      0
    );
    const percent = Math.round((count / totalOrdersCount) * 100);
    return {
      ...cfg,
      count,
      revenue,
      percent,
    };
  });

  // 2. Real-time Revenue Timeline Data from orders
  const getTimelineData = () => {
    const now = new Date();

    if (timeframe === "daily") {
      // Last 7 days
      return Array.from({ length: 7 }, (_, i) => {
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() - (6 - i));
        const dayStr = dayDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });

        const dayOrders = orders.filter((o) => {
          const od = new Date(o.createdAt || o.created_at || now);
          return (
            od.getDate() === dayDate.getDate() &&
            od.getMonth() === dayDate.getMonth() &&
            od.getFullYear() === dayDate.getFullYear()
          );
        });

        const rev = dayOrders.reduce(
          (sum, o) => sum + (parseFloat(o.totalAmount || o.total_amount || 0) || 0),
          0
        );

        return { label: dayStr, revenue: rev, count: dayOrders.length };
      });
    }

    if (timeframe === "weekly") {
      // Last 4 weeks (7-day intervals)
      return Array.from({ length: 4 }, (_, i) => {
        const startDaysAgo = (3 - i) * 7;
        const endDaysAgo = startDaysAgo - 7;
        const weekOrders = orders.filter((o) => {
          const od = new Date(o.createdAt || o.created_at || now);
          const diffDays = Math.floor((now - od) / (1000 * 60 * 60 * 24));
          return diffDays >= endDaysAgo && diffDays <= startDaysAgo;
        });

        const rev = weekOrders.reduce(
          (sum, o) => sum + (parseFloat(o.totalAmount || o.total_amount || 0) || 0),
          0
        );

        return { label: `Week ${i + 1}`, revenue: rev, count: weekOrders.length };
      });
    }

    if (timeframe === "monthly") {
      // Last 6 calendar months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return Array.from({ length: 6 }, (_, i) => {
        const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const m = targetMonthDate.getMonth();
        const y = targetMonthDate.getFullYear();

        const monthOrders = orders.filter((o) => {
          const od = new Date(o.createdAt || o.created_at || now);
          return od.getMonth() === m && od.getFullYear() === y;
        });

        const rev = monthOrders.reduce(
          (sum, o) => sum + (parseFloat(o.totalAmount || o.total_amount || 0) || 0),
          0
        );

        return {
          label: `${monthNames[m]} '${String(y).slice(2)}`,
          revenue: rev,
          count: monthOrders.length,
        };
      });
    }

    // Yearly
    const years = [now.getFullYear() - 1, now.getFullYear()];
    return years.map((yr) => {
      const yrOrders = orders.filter((o) => {
        const od = new Date(o.createdAt || o.created_at || now);
        return od.getFullYear() === yr;
      });
      const rev = yrOrders.reduce(
        (sum, o) => sum + (parseFloat(o.totalAmount || o.total_amount || 0) || 0),
        0
      );
      return { label: String(yr), revenue: rev, count: yrOrders.length };
    });
  };

  const timelineData = getTimelineData();
  const maxTimelineRevenue = Math.max(...timelineData.map((d) => d.revenue), 100);
  const maxStatusCount = Math.max(...statusMetrics.map((s) => s.count), 1);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-5">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
              Live Order Analytics & Dispatch Performance
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              ● Realtime Sync
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Realtime database analysis across revenue, fulfillment, and return lifecycle
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setChartView("revenue")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === "revenue"
                  ? "bg-plum text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Revenue Timeline
            </button>
            <button
              onClick={() => setChartView("status")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === "status"
                  ? "bg-plum text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Status Breakdown
            </button>
          </div>

          {/* Timeframe Switcher (only for Revenue Timeline) */}
          {chartView === "revenue" && (
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {["daily", "weekly", "monthly", "yearly"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                    timeframe === t
                      ? "bg-white text-plum shadow-xs font-black"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Area */}
      {chartView === "revenue" ? (
        <div className="pt-2 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {timelineData.map((dp, idx) => {
              const heightPercent =
                dp.revenue > 0
                  ? Math.max(10, Math.round((dp.revenue / maxTimelineRevenue) * 100))
                  : 4;
              return (
                <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2.5 rounded-lg font-bold shadow-lg pointer-events-none z-20 whitespace-nowrap">
                    <div>₹{dp.revenue.toLocaleString("en-IN")}</div>
                    <div className="text-emerald-400 font-semibold">{dp.count} Orders Placed</div>
                  </div>

                  <div className="w-full flex-1 bg-gray-100/80 rounded-t-lg overflow-hidden flex items-end border-b border-gray-200">
                    <div
                      className={`w-full transition-all duration-300 rounded-t-md shadow-xs ${
                        dp.revenue > 0
                          ? "bg-gradient-to-t from-plum to-plum/80 group-hover:from-plum-900 group-hover:to-plum"
                          : "bg-gray-300"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-[11px] font-bold text-gray-700 group-hover:text-plum transition-colors">
                      {dp.label}
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold">
                      ₹{dp.revenue.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Status Breakdown Bar Chart */
        <div className="pt-2 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 px-2">
            {statusMetrics.map((sm, idx) => {
              const heightPercent =
                sm.count > 0 ? Math.max(10, Math.round((sm.count / maxStatusCount) * 100)) : 4;
              return (
                <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2.5 rounded-lg font-bold shadow-lg pointer-events-none z-20 whitespace-nowrap">
                    <div>{sm.label}: {sm.count} Orders</div>
                    <div className="text-emerald-300 font-semibold">₹{sm.revenue.toLocaleString("en-IN")}</div>
                  </div>

                  <div className="w-full flex-1 bg-gray-100/80 rounded-t-lg overflow-hidden flex items-end border-b border-gray-200">
                    <div
                      className={`w-full bg-gradient-to-t ${sm.color} transition-all duration-300 rounded-t-md shadow-xs`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-[11px] font-extrabold text-gray-800 flex items-center justify-center gap-1">
                      <span>{sm.icon}</span>
                      <span className="hidden sm:inline">{sm.label}</span>
                    </div>
                    <div className="text-[11px] font-black text-plum">
                      {sm.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Live Status Performance Cards Matrix */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Realtime Order Status Distribution ({orders.length} Total Orders)
          </h4>
          <span className="text-[11px] text-gray-400 font-medium">
            Live counts & fulfillment values
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {statusMetrics.map((st) => (
            <div
              key={st.id}
              className={`p-3 rounded-xl border ${st.borderColor} ${st.bgColor} flex flex-col justify-between space-y-2 shadow-2xs hover:shadow-xs transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{st.icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 ${st.textColor} border ${st.borderColor}`}>
                  {st.label}
                </span>
              </div>

              <div>
                <div className="text-lg font-black text-gray-900 leading-tight">
                  {st.count}
                </div>
                <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                  ₹{st.revenue.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/90 h-1.5 rounded-full overflow-hidden border border-gray-200/50">
                <div
                  className={`h-full bg-gradient-to-r ${st.color} rounded-full`}
                  style={{ width: `${Math.max(5, st.percent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, cms, products, categories, orders
  const [sidebarOpen, setSidebarOpen] = useState(true); // Collapsible Sidebar navigation state

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
    delivery_settings: {
      standardFee: 79,
      freeThreshold: 999,
      estimateDays: "3-5 Business Days",
      online: {
        firstItemFee: 79,
        additionalItemFee: 25,
        freeThreshold: 999,
        estimateDays: "3-5 Business Days",
      },
      cod: {
        firstItemFee: 99,
        additionalItemFee: 35,
        freeThreshold: 1499,
        estimateDays: "4-7 Business Days",
        enabled: true,
      },
    },
    header_nav_menu: [
      { title: "Popular", url: "/shop" },
      { title: "Sarees & Handlooms", url: "/shop?category=sarees" },
      { title: "Kurtis & Tunics", url: "/shop?category=kurtis" },
      { title: "Full Sets & Anarkalis", url: "/shop?category=full-sets" },
      { title: "Blouses & Stitching", url: "/shop?category=blouses" },
      { title: "Lehenga Sets", url: "/shop?category=lehengas" },
      { title: "Kidswear & Pattu Pavadai", url: "/shop?category=kidswear" },
      { title: "About Us", url: "/about" },
      { title: "Contact Us", url: "/contact" },
    ],
  });

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    category: "Kurtis",
    subcategory: "",
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
    subcategories: [],
  });

  // Category Accordion & Inline Subcategory States
  const [expandedCategorySlug, setExpandedCategorySlug] = useState(null);
  const [newSubcategoryInputs, setNewSubcategoryInputs] = useState({});

  const [cmsSaveStatus, setCmsSaveStatus] = useState("");
  const [cmsSubTab, setCmsSubTab] = useState("banners");
  const [deliverySubTab, setDeliverySubTab] = useState("online");

  // Product Search, Filter, Bulk Select & View Modal States
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [subcategoryFilter, setSubcategoryFilter] = useState("All");
  const [badgeFilter, setBadgeFilter] = useState("All");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Order Management States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Replacement Modal States
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceForm, setReplaceForm] = useState({
    returnItemId: "",
    replacementProductId: "",
    replacementSize: "M",
    replacementColor: "",
    qty: 1,
  });

  // Custom Agal Boutique Popup & Return Modal States
  const [toastModal, setToastModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItemsState, setReturnItemsState] = useState([]);
  const [returnReason, setReturnReason] = useState("Size / Fitting Issue");

  const showToast = (message, type = "success", title = "") => {
    let defaultTitle = "Notice";
    if (type === "success") defaultTitle = "Success";
    if (type === "warning") defaultTitle = "Warning";
    if (type === "error") defaultTitle = "Action Failed";

    setToastModal({
      open: true,
      title: title || defaultTitle,
      message,
      type,
      onConfirm: null,
    });
  };

  const showConfirmModal = (message, onConfirm, title = "Confirm Action") => {
    setToastModal({
      open: true,
      title,
      message,
      type: "confirm",
      onConfirm,
    });
  };

  // Refreshing States
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [refreshingProducts, setRefreshingProducts] = useState(false);

  const handleRefreshOrders = async () => {
    setRefreshingOrders(true);
    try {
      const res = await adminGetOrders();
      if (res?.orders) setOrders(res.orders);
      const statsRes = await adminGetStats();
      if (statsRes?.stats) setStats(statsRes.stats);
    } catch (e) {
      console.error("Error refreshing orders:", e);
    } finally {
      setTimeout(() => setRefreshingOrders(false), 300);
    }
  };

  const handleRefreshProducts = async () => {
    setRefreshingProducts(true);
    try {
      const res = await getProducts({ limit: 200 });
      if (res?.products) setProducts(res.products);
    } catch (e) {
      console.error("Error refreshing products:", e);
    } finally {
      setTimeout(() => setRefreshingProducts(false), 300);
    }
  };

  // Check initial login state & set up real-time orders & products polling (sync frontend orders and inventory stock)
  useEffect(() => {
    const token = localStorage.getItem("agal_admin_token");
    if (token) {
      setIsAuthenticated(true);
      loadAllData();

      // Automatically sync incoming frontend orders, stats & inventory stock every 8 seconds
      const pollTimer = setInterval(() => {
        adminGetOrders().then((res) => {
          if (res?.orders) setOrders(res.orders);
        });
        adminGetStats().then((res) => {
          if (res?.stats) setStats(res.stats);
        });
        getProducts({ limit: 200 }).then((res) => {
          if (res?.products) setProducts(res.products);
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
      subcategory: "",
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
    const existingImages = (prod.images || [])
      .map((img) => (typeof img === "string" ? img : img?.url || ""))
      .filter(Boolean);
    const mainImg = existingImages[0] || "";
    const extraImgs = [existingImages[1] || "", existingImages[2] || "", existingImages[3] || ""];

    setProductForm({
      name: prod.name || "",
      slug: prod.slug || "",
      category: prod.category || "Kurtis",
      subcategory: prod.subcategory || "",
      price: prod.price || "",
      mrp: prod.mrp || "",
      ratingAvg: String(prod.rating?.avg || "4.6"),
      ratingCount: String(prod.rating?.count || "94"),
      fabric: prod.fabric || "",
      care: prod.care || "Dry clean recommended for first wash",
      occasionStr: Array.isArray(prod.occasion) ? prod.occasion.join(", ") : prod.occasion || "Festive, Party Wear",
      colorsStr: Array.isArray(prod.colors) ? prod.colors.join(", ") : prod.colors || "Gold, Red, Green",
      sizesList: Array.isArray(prod.sizes) && prod.sizes.length > 0
        ? prod.sizes.map((s) =>
            typeof s === "object"
              ? { label: s.label || "Free Size", color: s.color || "", stock: s.stock !== undefined ? s.stock : 10, price: s.price || "" }
              : { label: String(s), color: "", stock: 10, price: "" }
          )
        : [
            { label: "34", color: "", stock: 10, price: "" },
            { label: "36", color: "", stock: 5, price: "" },
            { label: "38", color: "", stock: 8, price: "" },
            { label: "40", color: "", stock: 2, price: "" },
          ],
      description: prod.description || "",
      imageUrl: mainImg,
      imagesList: extraImgs,
      isNew: Boolean(prod.isNew),
      isBestseller: Boolean(prod.isBestseller),
    });
    setShowProductModal(true);
  };

  const handleDuplicateProduct = (prod) => {
    setEditingProduct(null); // null means saving will create a new product entry
    const existingImages = (prod.images || [])
      .map((img) => (typeof img === "string" ? img : img?.url || ""))
      .filter(Boolean);
    const mainImg = existingImages[0] || "";
    const extraImgs = [existingImages[1] || "", existingImages[2] || "", existingImages[3] || ""];

    const dupName = `${prod.name || "Product"} (Copy)`;
    const dupSlug = `${(prod.slug || prod.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-copy`;

    setProductForm({
      name: dupName,
      slug: dupSlug,
      category: prod.category || "Kurtis",
      subcategory: prod.subcategory || "",
      price: prod.price || "",
      mrp: prod.mrp || "",
      ratingAvg: String(prod.rating?.avg || "4.6"),
      ratingCount: String(prod.rating?.count || "94"),
      fabric: prod.fabric || "",
      care: prod.care || "Dry clean recommended for first wash",
      occasionStr: Array.isArray(prod.occasion) ? prod.occasion.join(", ") : prod.occasion || "Festive, Party Wear",
      colorsStr: Array.isArray(prod.colors) ? prod.colors.join(", ") : prod.colors || "Gold, Red, Green",
      sizesList: Array.isArray(prod.sizes) && prod.sizes.length > 0
        ? prod.sizes.map((s) =>
            typeof s === "object"
              ? { label: s.label || "Free Size", color: s.color || "", stock: s.stock !== undefined ? s.stock : 10, price: s.price || "" }
              : { label: String(s), color: "", stock: 10, price: "" }
          )
        : [
            { label: "34", color: "", stock: 10, price: "" },
            { label: "36", color: "", stock: 5, price: "" },
            { label: "38", color: "", stock: 8, price: "" },
            { label: "40", color: "", stock: 2, price: "" },
          ],
      description: prod.description || "",
      imageUrl: mainImg,
      imagesList: extraImgs,
      isNew: Boolean(prod.isNew),
      isBestseller: Boolean(prod.isBestseller),
    });
    setShowProductModal(true);
  };

  const handleAutoGenerateVariants = (sizePreset = ["S", "M", "L", "XL", "XXL"]) => {
    const colorsArr = productForm.colorsStr
      ? productForm.colorsStr.split(",").map((c) => c.trim()).filter(Boolean)
      : [""];

    if (colorsArr.length === 0) colorsArr.push("");

    const newMatrix = [];
    colorsArr.forEach((color) => {
      sizePreset.forEach((sz) => {
        newMatrix.push({
          label: sz,
          color: color,
          stock: 10,
          price: productForm.price || "",
        });
      });
    });

    setProductForm((prev) => ({
      ...prev,
      sizesList: newMatrix,
    }));
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
      subcategory: productForm.subcategory || null,
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

    let res;
    if (editingProduct) {
      res = await adminUpdateProduct(editingProduct.id, payload);
    } else {
      res = await adminCreateProduct(payload);
    }

    if (res?.success) {
      showToast("Product saved successfully to database!", "success");
      setShowProductModal(false);
      loadAllData();
    } else {
      showToast(`Failed to save product: ${res?.message || res?.error || "Unknown server error"}`, "error");
    }
  };

  const handleDeleteProduct = (id) => {
    showConfirmModal("Are you sure you want to delete this product from DB?", async () => {
      await adminDeleteProduct(id);
      showToast("Product deleted successfully", "success");
      loadAllData();
    });
  };

  // Filter & Search product items
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !productSearch.trim() ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      String(p.id).toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subcategory?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.fabric?.toLowerCase().includes(productSearch.toLowerCase());

    const matchCategory =
      categoryFilter === "All" ||
      p.category?.toLowerCase() === categoryFilter.toLowerCase();

    const matchSubcategory =
      subcategoryFilter === "All" ||
      p.subcategory?.toLowerCase() === subcategoryFilter.toLowerCase();

    const matchBadge =
      badgeFilter === "All" ||
      (badgeFilter === "new" && p.isNew) ||
      (badgeFilter === "bestseller" && p.isBestseller);

    return matchSearch && matchCategory && matchSubcategory && matchBadge;
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

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    showConfirmModal(`Are you sure you want to delete ${selectedProductIds.length} selected products from DB?`, async () => {
      await adminBulkDeleteProducts(selectedProductIds);
      setSelectedProductIds([]);
      showToast(`${selectedProductIds.length} products deleted successfully`, "success");
      loadAllData();
    });
  };

  // Quick View Function
  const handleOpenViewProduct = (p) => {
    setViewingProduct(p);
    setShowViewModal(true);
  };

  // Category Actions
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", image: "", description: "", subcategories: [] });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    let subcats = [];
    try {
      subcats = typeof cat.subcategories === "string" ? JSON.parse(cat.subcategories) : (cat.subcategories || []);
    } catch (e) {
      subcats = [];
    }
    setCategoryForm({
      name: cat.name || "",
      slug: cat.slug || "",
      image: cat.image || "",
      description: cat.description || "",
      subcategories: Array.isArray(subcats) ? subcats : [],
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
      subcategories: categoryForm.subcategories,
    };

    if (editingCategory) {
      await adminUpdateCategory(editingCategory.id || editingCategory.slug, payload);
    } else {
      await adminCreateCategory(payload);
    }

    setShowCategoryModal(false);
    showToast("Category saved successfully", "success");
    loadAllData();
  };

  const handleDeleteCategory = (id) => {
    showConfirmModal("Are you sure you want to delete this category from DB?", async () => {
      await adminDeleteCategory(id);
      showToast("Category deleted successfully", "success");
      loadAllData();
    });
  };

  const handleAddSubcategoryToCategory = async (cat, subName) => {
    if (!subName || !subName.trim()) return;
    const trimmed = subName.trim();
    let current = [];
    try {
      current = typeof cat.subcategories === "string" ? JSON.parse(cat.subcategories) : (cat.subcategories || []);
    } catch (e) {
      current = [];
    }
    if (!Array.isArray(current)) current = [];
    if (current.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      showToast(`"${trimmed}" is already in ${cat.name}`, "error");
      return;
    }
    const updated = [...current, trimmed];
    const payload = {
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: cat.description,
      subcategories: updated,
    };
    await adminUpdateCategory(cat.id || cat.slug, payload);
    setNewSubcategoryInputs((prev) => ({ ...prev, [cat.slug || cat.id]: "" }));
    showToast(`Added "${trimmed}" to ${cat.name}`, "success");
    loadAllData();
  };

  const handleRemoveSubcategoryFromCategory = async (cat, subNameToRemove) => {
    let current = [];
    try {
      current = typeof cat.subcategories === "string" ? JSON.parse(cat.subcategories) : (cat.subcategories || []);
    } catch (e) {
      current = [];
    }
    if (!Array.isArray(current)) current = [];
    const updated = current.filter((s) => s !== subNameToRemove);
    const payload = {
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: cat.description,
      subcategories: updated,
    };
    await adminUpdateCategory(cat.id || cat.slug, payload);
    showToast(`Removed "${subNameToRemove}" from ${cat.name}`, "success");
    loadAllData();
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

  const handleDeleteOrder = (orderId) => {
    showConfirmModal(`Are you sure you want to delete Order #${orderId} permanently from database?`, async () => {
      await adminDeleteOrder(orderId);
      if (viewingOrder?.orderNumber === orderId || String(viewingOrder?.id) === String(orderId)) {
        setShowOrderModal(false);
        setViewingOrder(null);
      }
      showToast("Order deleted successfully", "success");
      loadAllData();
    });
  };

  const handleOpenReturnModal = (order) => {
    setViewingOrder(order);
    const initialItems = (order.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      size: item.size || "Free Size",
      color: item.color || "",
      price: item.price,
      image: item.image,
      maxQty: parseInt(item.qty || 1, 10),
      returnQty: parseInt(item.qty || 1, 10),
      selected: true,
    }));
    setReturnItemsState(initialItems);
    setReturnReason("Size / Fitting Issue");
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!viewingOrder) return;
    const orderId = viewingOrder.orderNumber || viewingOrder.id;

    const selectedReturnItems = returnItemsState
      .filter((i) => i.selected && i.returnQty > 0)
      .map((i) => ({
        id: i.id,
        name: i.name,
        slug: i.slug,
        size: i.size,
        color: i.color,
        returnQty: i.returnQty,
      }));

    if (selectedReturnItems.length === 0) {
      showToast("Please select at least 1 item and quantity to return.", "warning");
      return;
    }

    const res = await adminReturnOrder(orderId, {
      itemsToReturn: selectedReturnItems,
      reason: returnReason,
    });

    if (res?.success) {
      setShowReturnModal(false);
      showToast(res.message || "Order return processed and stock restored.", "success", "Return Completed");
      loadAllData();
      if (viewingOrder && (viewingOrder.orderNumber === orderId || String(viewingOrder.id) === String(orderId))) {
        const newLog = {
          id: "RET-" + Date.now(),
          timestamp: new Date().toISOString(),
          reason: returnReason,
          items: selectedReturnItems,
        };
        const updatedHist = Array.isArray(viewingOrder.returnHistory)
          ? [...viewingOrder.returnHistory, newLog]
          : [newLog];

        setViewingOrder((prev) => ({
          ...prev,
          orderStatus: "returned",
          paymentStatus: "refunded",
          returnHistory: updatedHist,
        }));
      }
    } else {
      showToast(res?.message || "Failed to process return.", "error", "Return Failed");
    }
  };

  const handleOpenReplaceModal = (order) => {
    setViewingOrder(order);
    const firstItem = order.items?.[0] || {};
    setReplaceForm({
      returnItemId: firstItem.id || "",
      replacementProductId: firstItem.id || products[0]?.id || "",
      replacementSize: firstItem.size || "M",
      replacementColor: firstItem.color || "",
      qty: 1,
      reason: "Size / Fitting Issue Exchange",
    });
    setShowReplaceModal(true);
  };

  const handleSubmitReplaceOrder = async (e) => {
    e.preventDefault();
    if (!viewingOrder) return;
    const orderId = viewingOrder.orderNumber || viewingOrder.id;

    const res = await adminReplaceOrder(orderId, replaceForm);
    if (res?.success) {
      setShowReplaceModal(false);
      showToast(res.message, "success", "Replacement Processed");
      loadAllData();

      const repLog = {
        id: "REP-" + Date.now(),
        type: "replacement",
        timestamp: new Date().toISOString(),
        reason: replaceForm.reason || "Size / Fitting Issue Exchange",
        returnedItemId: replaceForm.returnItemId,
        replacementProductId: replaceForm.replacementProductId,
        replacementSize: replaceForm.replacementSize,
        replacementColor: replaceForm.replacementColor,
        qty: replaceForm.qty,
      };

      setViewingOrder((prev) => {
        if (!prev) return prev;
        const updatedHist = Array.isArray(prev.returnHistory)
          ? [...prev.returnHistory, repLog]
          : [repLog];
        return {
          ...prev,
          orderStatus: "replaced",
          returnHistory: updatedHist,
        };
      });
    } else {
      showToast(res?.message || "Error processing replacement.", "error", "Replacement Failed");
    }
  };

  const handleOpenOrderDetails = (order) => {
    setViewingOrder(order);
    setShowOrderModal(true);
  };

  const handleSendInvoiceToPhone = async (order) => {
    const phone =
      order.customerPhone ||
      order.customer_phone ||
      order.shippingAddress?.phone ||
      "";
    if (!phone) {
      showToast("No customer phone number available for this order.", "warning", "Missing Phone");
      return;
    }
    try {
      showToast(`Preparing invoice for ${phone}...`, "info", "Sending Invoice");
      const res = await sendOrderInvoice(order.orderNumber || order.id, {
        phone,
        customerName: order.customerName || order.shippingAddress?.name,
        totalAmount: order.totalAmount || order.total_amount,
        paymentMethod: order.paymentMethod || order.payment_method,
        items: order.items,
        shippingAddress: order.shippingAddress,
      });

      if (res && res.whatsappUrl) {
        window.open(res.whatsappUrl, "_blank");
        showToast(`Invoice opened for +${res.phone} on WhatsApp`, "success", "Invoice Sent");
      } else {
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        window.open(
          `https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(
            `✨ Agal Boutique Tax Invoice for Order #${order.orderNumber} is available at: ${window.location.origin}/invoice/${order.orderNumber}`
          )}`,
          "_blank"
        );
        showToast("Opened WhatsApp to deliver invoice", "success", "Invoice Ready");
      }
    } catch (err) {
      showToast(err.message || "Failed to send invoice.", "error", "Delivery Error");
    }
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
      showToast(
        "CMS and Delivery settings have been successfully saved and are now live across the storefront!",
        "success",
        "Settings Saved Successfully"
      );
      setTimeout(() => setCmsSaveStatus(""), 3000);
      loadAllData();
    } else {
      setCmsSaveStatus("Failed to save settings.");
      showToast(
        res?.message || res?.error || "Failed to save settings to the database. Please try again.",
        "error",
        "Save Failed"
      );
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
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 text-sm">
      {/* COLLAPSIBLE SIDEBAR NAVIGATION */}
      <aside
        className={`bg-white border-r border-gray-200 sticky top-0 h-screen transition-all duration-300 z-40 flex flex-col justify-between shrink-0 ${
          sidebarOpen ? "w-68" : "w-20"
        }`}
      >
        <div>
          {/* Logo & Toggle Header */}
          <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Image src="/logo.png" alt="Agal Boutique" width={120} height={40} className="h-8 w-auto object-contain shrink-0" />
              {sidebarOpen && (
                <span className="text-xs font-black text-plum bg-plum/10 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {sidebarOpen ? <CaretLeft size={20} /> : <CaretRight size={20} />}
            </button>
          </div>

          {/* Navigation Items with Icons & Badges */}
          <nav className="p-3 space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                activeTab === "dashboard" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Dashboard"
            >
              <House size={22} className="shrink-0" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                activeTab === "products" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
              title={`Products (${products.length})`}
            >
              <div className="flex items-center gap-3">
                <Package size={22} className="shrink-0" />
                {sidebarOpen && <span>Products</span>}
              </div>
              {sidebarOpen && (
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${activeTab === "products" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                  {products.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                activeTab === "categories" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
              title={`Categories (${categoriesList.length})`}
            >
              <div className="flex items-center gap-3">
                <SquaresFour size={22} className="shrink-0" />
                {sidebarOpen && <span>Categories</span>}
              </div>
              {sidebarOpen && (
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${activeTab === "categories" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                  {categoriesList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                activeTab === "orders" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
              title={`Orders (${orders.length})`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="shrink-0" />
                {sidebarOpen && <span>Orders</span>}
              </div>
              {sidebarOpen && (
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("cms")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                activeTab === "cms" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Homepage CMS"
            >
              <Sliders size={22} className="shrink-0" />
              {sidebarOpen && <span>Storefront CMS</span>}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                activeTab === "settings" ? "bg-plum text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Delivery Settings"
            >
              <Gear size={22} className="shrink-0" />
              {sidebarOpen && <span>Delivery Settings</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 space-y-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 text-sm text-gray-700 hover:text-plum font-bold p-3 rounded-xl hover:bg-gray-100 transition-colors"
            title="View Live Storefront"
          >
            <Eye size={20} className="shrink-0" />
            {sidebarOpen && <span>View Storefront</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-sm text-red-600 hover:text-red-700 font-bold p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            title="Logout Admin Session"
          >
            <SignOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-y-auto">

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-700 mb-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Total Sales Revenue</span>
                  <CurrencyInr size={24} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-gray-900">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
                <p className="text-xs text-gray-500 mt-1 font-medium">From all confirmed orders in DB</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-700 mb-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag size={24} className="text-plum" />
                </div>
                <div className="text-3xl font-black text-gray-900">{stats.totalOrders}</div>
                <p className="text-xs text-gray-500 mt-1 font-medium">Database checkout count</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-700 mb-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Pending Orders</span>
                  <Clock size={24} className="text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-600">{stats.pendingOrders}</div>
                <p className="text-xs text-gray-500 mt-1 font-medium">Requires shipping dispatch</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between text-gray-700 mb-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Active DB Products</span>
                  <Package size={24} className="text-blue-600" />
                </div>
                <div className="text-3xl font-black text-gray-900">{stats.totalProducts}</div>
                <p className="text-xs text-gray-500 mt-1 font-medium">Live in store database</p>
              </div>
            </div>

            {/* Interactive Sales Analytics Bar Chart (Daily, Weekly, Monthly, Yearly) */}
            <SalesAnalyticsChart orders={orders} />

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
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                          <th className="py-2.5">Order #</th>
                          <th className="py-2.5">Customer</th>
                          <th className="py-2.5">Amount</th>
                          <th className="py-2.5">Payment</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.orderNumber || o.id}>
                            <td className="py-3 font-bold text-plum">{o.orderNumber}</td>
                            <td className="py-3">
                              <div className="font-semibold text-gray-900">{o.customerName}</div>
                              <div className="text-xs text-gray-500">{o.customerPhone}</div>
                            </td>
                            <td className="py-3 font-bold text-gray-900">₹{o.totalAmount}</td>
                            <td className="py-3 uppercase text-xs font-bold">
                              <span className={o.paymentMethod === "cod" ? "text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md" : "text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md"}>
                                {o.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="capitalize text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
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
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={handleRefreshProducts}
                    disabled={refreshingProducts}
                    title="Reload Products Data"
                    className="px-3.5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-gray-200"
                  >
                    <ArrowsClockwise size={16} className={refreshingProducts ? "animate-spin text-plum" : ""} />
                    <span>Reload Products</span>
                  </button>
                  <button
                    onClick={handleOpenNewProduct}
                    className="px-4 py-2.5 bg-plum text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-plum-900 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Inputs Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search title, ID, subcategory, fabric..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Main Category Filter */}
                <div className="flex items-center gap-2">
                  <Funnel size={18} className="text-gray-400 shrink-0" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setSubcategoryFilter("All");
                    }}
                    className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white cursor-pointer font-medium"
                  >
                    <option value="All">All Categories</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category Filter */}
                <div>
                  <select
                    value={subcategoryFilter}
                    onChange={(e) => setSubcategoryFilter(e.target.value)}
                    className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white cursor-pointer font-medium"
                  >
                    <option value="All">All Sub-Categories</option>
                    {(() => {
                      const activeCat = categoriesList.find((c) => c.name?.toLowerCase() === categoryFilter.toLowerCase());
                      let subList = [];
                      if (activeCat) {
                        try {
                          subList = typeof activeCat.subcategories === "string" ? JSON.parse(activeCat.subcategories) : (activeCat.subcategories || []);
                        } catch (e) {
                          subList = [];
                        }
                      } else {
                        const set = new Set();
                        categoriesList.forEach((c) => {
                          let subs = [];
                          try {
                            subs = typeof c.subcategories === "string" ? JSON.parse(c.subcategories) : (c.subcategories || []);
                          } catch (e) {
                            subs = [];
                          }
                          if (Array.isArray(subs)) subs.forEach((s) => set.add(s));
                        });
                        subList = Array.from(set);
                      }
                      if (!Array.isArray(subList)) subList = [];
                      return subList.map((sub, idx) => (
                        <option key={idx} value={sub}>
                          {sub}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                {/* Badge Filter */}
                <div>
                  <select
                    value={badgeFilter}
                    onChange={(e) => setBadgeFilter(e.target.value)}
                    className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white cursor-pointer font-medium"
                  >
                    <option value="All">All Showcase Sections</option>
                    <option value="new">Fresh Arrivals & New Weaves</option>
                    <option value="bestseller">Most Loved Bestsellers</option>
                  </select>
                </div>
              </div>

              {/* Bulk Delete Bar (Appears when items are selected) */}
              {selectedProductIds.length > 0 && (
                <div className="flex items-center justify-between p-3.5 bg-red-50 border border-red-200 rounded-xl animate-fade-in text-sm">
                  <span className="font-bold text-red-800">
                    {selectedProductIds.length} {selectedProductIds.length === 1 ? "product" : "products"} selected for bulk action
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="px-3 py-1.5 text-gray-700 hover:bg-red-100 rounded-lg font-bold cursor-pointer"
                    >
                      Cancel Selection
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer text-sm"
                    >
                      <Trash size={16} />
                      <span>Bulk Delete ({selectedProductIds.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Products Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-10 text-center">
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
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category & Sub-Category</th>
                      <th className="py-3.5 px-4">Price / MRP</th>
                      <th className="py-3.5 px-4">Stock Qty</th>
                      <th className="py-3.5 px-4">Showcase Section</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500 italic text-sm">
                          No matching products found. Try adjusting your search or filters!
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        const totalStock = Array.isArray(p.sizes)
                          ? p.sizes.reduce((sum, s) => sum + (typeof s === "object" && s.stock !== undefined ? parseInt(s.stock ?? 0, 10) : 10), 0)
                          : 0;

                        return (
                          <tr
                            key={p.id}
                            className={`transition-colors ${
                              isSelected ? "bg-plum/5" : "hover:bg-gray-50/80"
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectProduct(p.id)}
                                className="w-4 h-4 rounded text-plum cursor-pointer"
                              />
                            </td>
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <img
                                src={normalizeImageUrl(p.images?.[0]) || "/logo.png"}
                                alt={p.name}
                                className="w-12 h-14 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-200"
                                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                              />
                              <div>
                                <div className="font-bold text-sm sm:text-base text-gray-900">{p.name}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {p.id}</div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-sm text-gray-900">{p.category}</div>
                              {p.subcategory ? (
                                <span className="inline-flex items-center gap-1 mt-1 bg-plum/10 text-plum border border-plum/20 font-bold px-2.5 py-0.5 rounded-md text-xs">
                                  {p.subcategory}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic block mt-0.5">No Sub-Category</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-sm sm:text-base text-gray-900">₹{p.price}</span>
                              {p.mrp && <span className="text-gray-400 line-through text-xs ml-1.5">₹{p.mrp}</span>}
                            </td>
                            <td className="py-3.5 px-4 font-semibold">
                              {totalStock <= 0 ? (
                                <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-md text-xs border border-red-200 inline-block">
                                  0 units (Out of Stock)
                                </span>
                              ) : totalStock <= 5 ? (
                                <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-md text-xs border border-amber-200 inline-block">
                                  ⚡ {totalStock} units left
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-md text-xs border border-emerald-200 inline-block">
                                  ✓ {totalStock} units
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1 items-start">
                                {p.isNew && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                                    ✦ Fresh Arrivals & New Weaves
                                  </span>
                                )}
                                {p.isBestseller && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                                    ★ Most Loved Bestsellers
                                  </span>
                                )}
                                {!p.isNew && !p.isBestseller && (
                                  <span className="text-gray-400 text-xs italic">-</span>
                                )}
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
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                  title="Duplicate Product"
                                >
                                  <Copy size={16} />
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
                <h2 className="text-base font-bold text-gray-900">Database Categories & Sub-Categories</h2>
                <p className="text-xs text-gray-500">
                  Expand any category accordion to add or remove sub-categories. Changes instantly update the storefront and product manager.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedCategorySlug(expandedCategorySlug ? null : (categoriesList[0]?.slug || categoriesList[0]?.id))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  {expandedCategorySlug ? "Collapse All" : "Expand First"}
                </button>
                <button
                  onClick={handleOpenNewCategory}
                  className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={16} />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Slug</th>
                      <th className="py-3.5 px-4">Sub-Categories (Accordion)</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoriesList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 italic text-xs">
                          No categories in MySQL database. Click "Add Category" above to create one!
                        </td>
                      </tr>
                    ) : (
                      categoriesList.map((cat) => {
                        const catKey = cat.slug || cat.id;
                        const isExpanded = expandedCategorySlug === catKey;
                        let subcats = [];
                        try {
                          subcats = typeof cat.subcategories === "string" ? JSON.parse(cat.subcategories) : (cat.subcategories || []);
                        } catch (e) {
                          subcats = [];
                        }
                        if (!Array.isArray(subcats)) subcats = [];

                        return (
                          <React.Fragment key={catKey}>
                            <tr
                              onClick={() => setExpandedCategorySlug(isExpanded ? null : catKey)}
                              className={`transition-colors cursor-pointer ${
                                isExpanded ? "bg-plum/5" : "hover:bg-gray-50/80"
                              }`}
                            >
                              <td className="py-3.5 px-4 flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedCategorySlug(isExpanded ? null : catKey);
                                  }}
                                  className="text-gray-400 hover:text-plum p-1 rounded hover:bg-gray-100 transition-colors"
                                  title={isExpanded ? "Collapse Sub-Categories" : "Expand Sub-Categories"}
                                >
                                  {isExpanded ? <CaretDown size={16} className="text-plum" /> : <CaretRight size={16} />}
                                </button>
                                {cat.image ? (
                                  <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-full shrink-0 border border-gray-200" />
                                ) : (
                                  <div className="w-10 h-10 bg-plum/10 rounded-full flex items-center justify-center font-bold text-plum shrink-0">
                                    {cat.name?.[0]}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-gray-900 block text-sm sm:text-base">{cat.name}</span>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {products.filter((p) => p.category?.toLowerCase() === cat.name?.toLowerCase()).length} products
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-gray-700 text-xs">{cat.slug}</td>
                              <td className="py-3.5 px-4 max-w-sm">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {subcats.length > 0 ? (
                                    subcats.map((s, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-purple-100 text-gray-800 hover:text-plum text-xs font-semibold px-2.5 py-1 rounded-md transition-all"
                                      >
                                        <span>{s}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveSubcategoryFromCategory(cat, s);
                                          }}
                                          className="text-gray-400 hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                                          title={`Remove ${s}`}
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 italic text-xs">No sub-categories</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedCategorySlug(catKey);
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-plum bg-plum/10 hover:bg-plum hover:text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                    title="Add Sub-Category"
                                  >
                                    <Plus size={12} />
                                    <span>Add</span>
                                  </button>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-gray-700 text-sm max-w-xs truncate">{cat.description}</td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleOpenEditCategory(cat)}
                                    className="p-2 text-gray-600 hover:text-plum hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Category Details"
                                  >
                                    <Pencil size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id || cat.slug)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Category"
                                  >
                                    <Trash size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* ACCORDION EXPANDED PANEL FOR SUB-CATEGORIES */}
                            {isExpanded && (
                              <tr className="bg-plum/5 border-t border-b border-purple-200/60">
                                <td colSpan={5} className="p-4 pl-12">
                                  <div className="bg-white rounded-xl border border-purple-200 p-5 space-y-3 shadow-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-plum animate-pulse"></div>
                                        <h4 className="text-sm font-bold text-gray-900">
                                          Sub-Categories for <span className="text-plum font-extrabold">{cat.name}</span>
                                        </h4>
                                        <span className="text-xs font-bold text-plum bg-plum/10 px-2.5 py-0.5 rounded-full">
                                          {subcats.length} sub-categories
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        Reflected in Products table, Category Filter, and Website Header Drawer
                                      </span>
                                    </div>

                                    {/* Active Sub-Categories Pills */}
                                    <div className="space-y-2">
                                      <label className="block text-xs font-bold text-gray-700">
                                        Active Sub-Categories (Click ✕ to Remove):
                                      </label>
                                      {subcats.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                          {subcats.map((s, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-950 border border-purple-200 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
                                            >
                                              <span>{s}</span>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveSubcategoryFromCategory(cat, s)}
                                                className="text-purple-400 hover:text-red-600 hover:bg-white rounded p-0.5 transition-colors cursor-pointer"
                                                title={`Remove ${s}`}
                                              >
                                                <X size={14} />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-400 italic">No sub-categories added yet for {cat.name}. Use the input below to add one!</p>
                                      )}
                                    </div>

                                    {/* Inline Add Sub-Category Input */}
                                    <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                      <input
                                        type="text"
                                        placeholder={`Add new sub-category to ${cat.name} (e.g. Linen Sarees, Party Wear)...`}
                                        value={newSubcategoryInputs[catKey] || ""}
                                        onChange={(e) =>
                                          setNewSubcategoryInputs((prev) => ({
                                            ...prev,
                                            [catKey]: e.target.value,
                                          }))
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddSubcategoryToCategory(cat, newSubcategoryInputs[catKey]);
                                          }
                                        }}
                                        className="flex-1 h-10 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-gray-50/50"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAddSubcategoryToCategory(cat, newSubcategoryInputs[catKey])}
                                        className="px-5 py-2.5 bg-plum text-white text-sm font-bold rounded-xl hover:bg-plum-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                                      >
                                        <Plus size={16} />
                                        <span>Add Sub-Category</span>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
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
                  <h2 className="text-xl font-extrabold text-gray-900">Database Customer Orders ({filteredOrders.length})</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Live order sync from frontend checkout. Filter, inspect items, update status, or process returns.</p>
                </div>
                <button
                  onClick={handleRefreshOrders}
                  disabled={refreshingOrders}
                  title="Reload Orders Data"
                  className="px-4 py-2.5 bg-plum text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-plum-900 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <ArrowsClockwise size={18} className={refreshingOrders ? "animate-spin" : ""} />
                  <span>Reload Orders</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order #, customer name, phone, email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch("")}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Funnel size={18} className="text-gray-400 shrink-0" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white cursor-pointer font-medium"
                  >
                    <option value="All">All Dispatch Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                    <option value="replaced">Replaced</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-gray-200 text-gray-500 text-sm italic">
                  No matching orders found in database.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div key={o.orderNumber || o.id} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs hover:border-plum/40 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base sm:text-lg font-black text-plum">Order #{o.orderNumber}</span>
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Return Badge */}
                        {(o.orderStatus === "returned" || (Array.isArray(o.returnHistory) && o.returnHistory.length > 0)) && (
                          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs bg-red-100 text-red-900 border-red-300 flex items-center gap-1">
                            <ArrowUDownLeft size={14} weight="bold" />
                            <span>Returned {Array.isArray(o.returnHistory) && o.returnHistory.length > 0 ? `(${o.returnHistory.length})` : ""}</span>
                          </span>
                        )}

                        {/* Payment Method Online / COD Badge */}
                        <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${
                          (o.paymentMethod || o.payment_method || "").toLowerCase() === "cod"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}>
                          {(o.paymentMethod || o.payment_method || "").toLowerCase() === "cod" ? "💵 COD" : "💳 ONLINE"} (₹{o.totalAmount ?? o.total_amount ?? o.total ?? 0})
                        </span>

                        <select
                          value={o.orderStatus || "confirmed"}
                          onChange={(e) => handleUpdateOrderStatus(o.orderNumber || o.id, e.target.value, o.paymentStatus)}
                          className="h-9 px-3 text-sm font-bold border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-plum cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="returned">Returned</option>
                          <option value="replaced">Replaced</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <Link
                          href={`/invoice/${o.orderNumber || o.id}`}
                          target="_blank"
                          className="p-2 text-plum hover:bg-plum/10 rounded-lg transition-colors cursor-pointer"
                          title="Download / View Tax Invoice (PDF)"
                        >
                          <FileText size={20} weight="bold" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleSendInvoiceToPhone(o)}
                          className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors cursor-pointer"
                          title="Send Invoice to Customer Phone via WhatsApp"
                        >
                          <WhatsappLogo size={20} weight="fill" />
                        </button>

                        <button
                          onClick={() => handleOpenOrderDetails(o)}
                          className="p-2 text-gray-600 hover:text-plum hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="View Full Order Details"
                        >
                          <Eye size={20} />
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(o.orderNumber || o.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Order Record"
                        >
                          <Trash size={20} />
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                          <div>
                            <div className="font-bold text-gray-500 mb-1.5 uppercase tracking-wider text-xs">Customer Details</div>
                            <div className="font-bold text-gray-900 text-base">{cName}</div>
                            <div className="text-gray-700 font-medium">{cPhone ? `+91 ${cPhone}` : ""}</div>
                            <div className="text-gray-500 text-xs">{cEmail}</div>
                          </div>

                          <div>
                            <div className="font-bold text-gray-500 mb-1.5 uppercase tracking-wider text-xs">Delivery Address</div>
                            <div className="text-gray-800 font-medium leading-relaxed">
                              {sLine1 ? `${sLine1}, ` : ""}{sCity ? `${sCity}, ` : ""}{sState ? `${sState} - ` : ""}<strong>{sPin}</strong> ({sTag})
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-gray-500 mb-1.5 uppercase tracking-wider text-xs">Items Summary ({o.items?.length || 0})</div>
                            <div className="space-y-1.5">
                              {o.items?.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-gray-800 text-sm">
                                  <span className="truncate max-w-[240px] font-medium" title={`${item.name} (${item.size || "Free Size"}${item.color ? `, Color: ${item.color}` : ""})`}>
                                    {item.name} ({item.size || "Free Size"}{item.color ? ` • ${item.color}` : ""}) × {item.qty}
                                  </span>
                                  <span className="font-bold text-gray-900">₹{item.price * item.qty}</span>
                                </div>
                              ))}
                              {o.items?.length > 3 && (
                                <div className="text-xs text-plum font-bold cursor-pointer hover:underline mt-1" onClick={() => handleOpenOrderDetails(o)}>
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
        {/* TAB 5: STORE CMS SETTINGS (TABBED SECTION) */}
        {activeTab === "cms" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
            {/* CMS Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2.5">
                  <Sliders size={24} className="text-plum" />
                  <span>Live Storefront CMS Settings</span>
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage dynamic hero banners, announcement marquee, navigation menus, and store pages. Updates reflect live from MySQL database.
                </p>
              </div>
              {cmsSaveStatus && (
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full animate-fade-in flex items-center gap-1.5 self-start sm:self-auto">
                  <span>✓</span>
                  <span>{cmsSaveStatus}</span>
                </span>
              )}
            </div>

            {/* THEME-DESIGNED CMS SUB-TABS NAVIGATION BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 no-scrollbar">
              {[
                { id: "banners", label: "Hero Banners", icon: ImageSquare, count: (cms.hero_slides || []).length },
                { id: "announcement", label: "Announcement Bar", icon: Megaphone },
                { id: "header_menu", label: "Header Nav Menu", icon: NavigationArrow, count: (cms.header_nav_menu || []).length },
                { id: "about_us", label: "About Us Page", icon: BookOpen },
                { id: "contact_us", label: "Contact Us & Store", icon: PhoneCall },
              ].map((tab) => {
                const isActive = cmsSubTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCmsSubTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-plum text-white shadow-sm ring-2 ring-purple-300"
                        : "bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/60"
                    }`}
                  >
                    <Icon size={18} weight={isActive ? "fill" : "bold"} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                          isActive ? "bg-white/20 text-white" : "bg-plum/10 text-plum"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* SUB-TAB 1: HERO CAROUSEL BANNERS */}
            {cmsSubTab === "banners" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 border border-purple-200/60 p-4 rounded-xl">
                  <div>
                    <h3 className="text-base font-bold text-plum flex items-center gap-2">
                      <ImageSquare size={20} weight="bold" />
                      <span>Promotional Banner Slides ({ (cms.hero_slides || []).length })</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      💡 <strong>Clean Graphic Mode:</strong> If Title & Subtitle are left empty, the website shows your full image edge-to-edge without any dark color overlay or button.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSlides = [
                        ...(cms.hero_slides || []),
                        {
                          id: Date.now(),
                          title: "",
                          subtitle: "",
                          offer: "",
                          link: "/shop",
                          cta: "Shop Collection",
                          badge: "Exclusive",
                          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
                        },
                      ];
                      setCms({ ...cms, hero_slides: newSlides });
                    }}
                    className="px-4 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    <Plus size={16} weight="bold" />
                    <span>Add New Banner Slide</span>
                  </button>
                </div>

                {/* Slides List */}
                <div className="space-y-5">
                  {(cms.hero_slides || []).length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
                      No banner slides added yet. Click &quot;Add New Banner Slide&quot; above to add your first banner!
                    </div>
                  ) : (
                    (cms.hero_slides || []).map((slide, idx) => (
                      <div key={slide.id || idx} className="p-5 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-4 hover:border-plum/40 transition-all">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-plum bg-plum/10 px-3 py-1 rounded-lg">
                              Slide #{idx + 1}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {slide.title ? `"${slide.title}"` : "Clean Full Image Mode (No Text Overlay)"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (cms.hero_slides || []).filter((_, i) => i !== idx);
                              setCms({ ...cms, hero_slides: updated });
                            }}
                            className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Trash size={16} />
                            <span>Delete Slide</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">
                              Headline Title (Leave blank for clean image)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Grand Festive Handloom Mela (or leave blank)"
                              value={slide.title || ""}
                              onChange={(e) => {
                                const updated = [...(cms.hero_slides || [])];
                                updated[idx].title = e.target.value;
                                setCms({ ...cms, hero_slides: updated });
                              }}
                              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">
                              Subtitle Description (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Pure Kanchipuram Silks & Handlooms (or leave blank)"
                              value={slide.subtitle || ""}
                              onChange={(e) => {
                                const updated = [...(cms.hero_slides || [])];
                                updated[idx].subtitle = e.target.value;
                                setCms({ ...cms, hero_slides: updated });
                              }}
                              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">
                              Offer Badge / Highlight Tag (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Flat 15% OFF with Code FESTIVE15"
                              value={slide.offer || ""}
                              onChange={(e) => {
                                const updated = [...(cms.hero_slides || [])];
                                updated[idx].offer = e.target.value;
                                setCms({ ...cms, hero_slides: updated });
                              }}
                              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">
                              Target Link URL (Clickable destination)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. /shop?category=sarees"
                              value={slide.link || ""}
                              onChange={(e) => {
                                const updated = [...(cms.hero_slides || [])];
                                updated[idx].link = e.target.value;
                                setCms({ ...cms, hero_slides: updated });
                              }}
                              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum font-mono text-plum bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">
                              CTA Button Label (Only shown if Title is present)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Shop Collection"
                              value={slide.cta || ""}
                              onChange={(e) => {
                                const updated = [...(cms.hero_slides || [])];
                                updated[idx].cta = e.target.value;
                                setCms({ ...cms, hero_slides: updated });
                              }}
                              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-800 mb-1">
                              Exclusive Badge Tag (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Festive Exclusive"
                              value={slide.badge || ""}
                              onChange={(e) => {
                                const updated = [...(cms.hero_slides || [])];
                                updated[idx].badge = e.target.value;
                                setCms({ ...cms, hero_slides: updated });
                              }}
                              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-2">
                            <ImageUploadInput
                              label="Slide Banner Graphic Image"
                              recommendedSize="1920 × 550 px (Desktop 3.5:1) · 800 × 400 px (Mobile 2:1)"
                              placeholder="e.g. 1920 × 550 px banner image URL or click Upload & Optimize File"
                              value={slide.image || slide.banner_url || ""}
                              onChange={(url) => {
                                const updated = [...(cms.hero_slides || [])];
                                updated[idx].image = url;
                                updated[idx].banner_url = url;
                                setCms({ ...cms, hero_slides: updated });
                              }}
                            />
                            {(slide.image || slide.banner_url) && (
                              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                  <span>Exact UI Banner Proportion Preview (1920 × 550 px · 3.5:1 Ratio):</span>
                                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Exact Storefront UI Match
                                  </span>
                                </div>
                                <div className="relative w-full aspect-[3.5/1] max-h-[190px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs">
                                  <img
                                    src={slide.image || slide.banner_url}
                                    alt={slide.title || "Banner Preview"}
                                    className="w-full h-full object-cover object-center"
                                  />
                                </div>
                                <div className="text-[11px] text-gray-500 flex items-center justify-between">
                                  <span>💻 Desktop UI: 1920 × 550 px (3.5:1 ratio)</span>
                                  <span>📱 Mobile UI: 800 × 400 px (2:1 ratio)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveCms("hero_slides", cms.hero_slides)}
                    className="px-6 py-3 bg-plum text-white text-sm font-bold rounded-xl hover:bg-plum-900 transition-colors cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <ImageSquare size={18} weight="bold" />
                    <span>Save Hero Slides to Database</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: ANNOUNCEMENT MARQUEE BAR */}
            {cmsSubTab === "announcement" && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div className="p-5 bg-purple-50/60 border border-purple-200/60 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/50 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-plum flex items-center gap-2">
                        <Megaphone size={20} weight="bold" />
                        <span>Top Header Announcement Marquee Bar</span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Promote active discount coupons, free shipping offers, or announcements across all pages.
                      </p>
                    </div>

                    <label className="flex items-center gap-2.5 text-sm font-bold text-gray-800 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs">
                      <input
                        type="checkbox"
                        checked={cms.announcement_bar?.enabled !== false}
                        onChange={(e) =>
                          setCms({
                            ...cms,
                            announcement_bar: { ...(cms.announcement_bar || {}), enabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-plum cursor-pointer"
                      />
                      <span>Enable Marquee</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">
                      Announcement Text Content
                    </label>
                    <input
                      type="text"
                      value={cms.announcement_bar?.text || ""}
                      onChange={(e) =>
                        setCms({
                          ...cms,
                          announcement_bar: { ...(cms.announcement_bar || {}), text: e.target.value },
                        })
                      }
                      placeholder="✨ Free Express Delivery across India on orders above ₹999 | Direct WhatsApp Support"
                      className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum font-medium bg-white"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-100 text-sm text-purple-900">
                    <strong>Preview:</strong> &quot;{cms.announcement_bar?.text || "✨ Free Express Delivery across India on orders above ₹999"}&quot;
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveCms("announcement_bar", cms.announcement_bar)}
                    className="px-6 py-2.5 bg-plum text-white text-sm font-bold rounded-xl hover:bg-plum-900 transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    <Megaphone size={18} />
                    <span>Save Announcement Bar to DB</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: HEADER NAVIGATION MENU */}
            {cmsSubTab === "header_menu" && (
              <div className="space-y-6 animate-fade-in max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 border border-purple-200/60 p-4 rounded-xl">
                  <div>
                    <h3 className="text-base font-bold text-plum flex items-center gap-2">
                      <NavigationArrow size={20} weight="bold" />
                      <span>Header Navigation Links ({ (cms.header_nav_menu || []).length })</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Configure navigation links shown under the main header on desktop and in the category drawer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentMenu = Array.isArray(cms.header_nav_menu) ? cms.header_nav_menu : [];
                      const updated = [...currentMenu, { title: "New Item", url: "/shop" }];
                      setCms({ ...cms, header_nav_menu: updated });
                    }}
                    className="px-4 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    <Plus size={16} weight="bold" />
                    <span>Add Menu Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(Array.isArray(cms.header_nav_menu) ? cms.header_nav_menu : []).map((item, mIdx) => (
                    <div key={mIdx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Menu Title / Label</label>
                          <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) => {
                              const updated = [...(cms.header_nav_menu || [])];
                              updated[mIdx] = { ...updated[mIdx], title: e.target.value };
                              setCms({ ...cms, header_nav_menu: updated });
                            }}
                            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum font-semibold bg-white"
                            placeholder="e.g. Sarees & Silks"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Target Link URL</label>
                          <input
                            type="text"
                            value={item.url || ""}
                            onChange={(e) => {
                              const updated = [...(cms.header_nav_menu || [])];
                              updated[mIdx] = { ...updated[mIdx], url: e.target.value };
                              setCms({ ...cms, header_nav_menu: updated });
                            }}
                            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum font-mono text-plum bg-white"
                            placeholder="e.g. /shop?category=sarees"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = (cms.header_nav_menu || []).filter((_, i) => i !== mIdx);
                          setCms({ ...cms, header_nav_menu: updated });
                        }}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Remove Menu Item"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveCms("header_nav_menu", cms.header_nav_menu)}
                    className="px-6 py-3 bg-plum text-white text-sm font-bold rounded-xl hover:bg-plum-900 transition-colors cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <NavigationArrow size={18} />
                    <span>Save Navigation Menu to DB</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: ABOUT US PAGE */}
            {cmsSubTab === "about_us" && (
              <div className="space-y-6 animate-fade-in max-w-4xl">
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-5">
                  <h3 className="text-base font-bold text-plum border-l-4 border-plum pl-2.5">
                    About Us Page Hero & Story Content
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Hero Title</label>
                      <input
                        type="text"
                        value={cms.about_cms?.hero_title || ""}
                        onChange={(e) =>
                          setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), hero_title: e.target.value } })
                        }
                        className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Hero Subtitle</label>
                      <input
                        type="text"
                        value={cms.about_cms?.hero_subtitle || ""}
                        onChange={(e) =>
                          setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), hero_subtitle: e.target.value } })
                        }
                        className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      />
                    </div>
                  </div>

                  <ImageUploadInput
                    label="About Us Hero Background Image"
                    recommendedSize="1200 × 500 px (Landscape Banner)"
                    value={cms.about_cms?.hero_image || ""}
                    onChange={(url) =>
                      setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), hero_image: url } })
                    }
                  />

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-bold text-gray-900">Brand Story Section</label>
                    <input
                      type="text"
                      placeholder="Story Headline"
                      value={cms.about_cms?.story_headline || ""}
                      onChange={(e) =>
                        setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), story_headline: e.target.value } })
                      }
                      className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                    />
                    <textarea
                      rows={4}
                      placeholder="Story Paragraph"
                      value={cms.about_cms?.story_text || ""}
                      onChange={(e) =>
                        setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), story_text: e.target.value } })
                      }
                      className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                    />
                    <ImageUploadInput
                      label="Story Showcase Image"
                      recommendedSize="800 × 600 px (4:3 Photo)"
                      value={cms.about_cms?.story_image || ""}
                      onChange={(url) =>
                        setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), story_image: url } })
                      }
                    />
                  </div>

                  {/* Craftsmanship Feature Cards */}
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-bold text-gray-900">
                      Craftsmanship Highlights (3 Feature Cards)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {((cms.about_cms?.cards) || [{}, {}, {}]).map((c, cIdx) => (
                        <div key={cIdx} className="p-4 bg-white border border-gray-200 rounded-xl space-y-2.5">
                          <span className="text-xs font-black text-plum">Feature Card #{cIdx + 1}</span>
                          <input
                            type="text"
                            placeholder="Card Title"
                            value={c.title || ""}
                            onChange={(e) => {
                              const updatedCards = [...((cms.about_cms?.cards) || [{}, {}, {}])];
                              updatedCards[cIdx] = { ...updatedCards[cIdx], title: e.target.value };
                              setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), cards: updatedCards } });
                            }}
                            className="w-full h-9 px-2.5 text-xs font-bold border border-gray-300 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Card Text"
                            value={c.text || ""}
                            onChange={(e) => {
                              const updatedCards = [...((cms.about_cms?.cards) || [{}, {}, {}])];
                              updatedCards[cIdx] = { ...updatedCards[cIdx], text: e.target.value };
                              setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), cards: updatedCards } });
                            }}
                            className="w-full h-9 px-2.5 text-xs border border-gray-300 rounded-lg"
                          />
                          <ImageUploadInput
                            label={`Card #${cIdx + 1} Image`}
                            recommendedSize="600 × 400 px"
                            value={c.image || ""}
                            onChange={(url) => {
                              const updatedCards = [...((cms.about_cms?.cards) || [{}, {}, {}])];
                              updatedCards[cIdx] = { ...updatedCards[cIdx], image: url };
                              setCms({ ...cms, about_cms: { ...(cms.about_cms || {}), cards: updatedCards } });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveCms("about_cms", cms.about_cms)}
                      className="px-6 py-3 bg-plum text-white text-sm font-bold rounded-xl hover:bg-plum-900 transition-colors cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <BookOpen size={18} />
                      <span>Save About Us Page to DB</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: CONTACT US & STORE DETAILS */}
            {cmsSubTab === "contact_us" && (
              <div className="space-y-6 animate-fade-in max-w-4xl">
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-5">
                  <h3 className="text-base font-bold text-plum border-l-4 border-plum pl-2.5">
                    Contact Us & Store Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Page Title</label>
                      <input
                        type="text"
                        value={cms.contact_cms?.title || ""}
                        onChange={(e) =>
                          setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), title: e.target.value } })
                        }
                        className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={cms.contact_cms?.subtitle || ""}
                        onChange={(e) =>
                          setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), subtitle: e.target.value } })
                        }
                        className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        value={cms.contact_cms?.whatsapp || ""}
                        onChange={(e) =>
                          setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), whatsapp: e.target.value } })
                        }
                        className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Helpline Phone</label>
                      <input
                        type="text"
                        value={cms.contact_cms?.phone || ""}
                        onChange={(e) =>
                          setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), phone: e.target.value } })
                        }
                        className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={cms.contact_cms?.email || ""}
                        onChange={(e) =>
                          setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), email: e.target.value } })
                        }
                        className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">Boutique Physical Address</label>
                    <input
                      type="text"
                      value={cms.contact_cms?.address || ""}
                      onChange={(e) =>
                        setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), address: e.target.value } })
                      }
                      className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={cms.contact_cms?.hours || ""}
                      onChange={(e) =>
                        setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), hours: e.target.value } })
                      }
                      className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">Google Maps Embed URL</label>
                    <input
                      type="text"
                      value={cms.contact_cms?.map_url || ""}
                      onChange={(e) =>
                        setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), map_url: e.target.value } })
                      }
                      className="w-full h-11 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum font-mono text-plum bg-white"
                    />
                  </div>

                  <ImageUploadInput
                    label="Contact Page Header Banner"
                    recommendedSize="1200 × 500 px (Landscape Banner)"
                    value={cms.contact_cms?.banner_image || ""}
                    onChange={(url) =>
                      setCms({ ...cms, contact_cms: { ...(cms.contact_cms || {}), banner_image: url } })
                    }
                  />

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveCms("contact_cms", cms.contact_cms);
                        if (cms.contact_cms?.whatsapp) {
                          handleSaveCms("store_info", {
                            whatsapp: cms.contact_cms.whatsapp,
                            phone: cms.contact_cms.phone,
                            email: cms.contact_cms.email,
                            address: cms.contact_cms.address,
                          });
                        }
                      }}
                      className="px-6 py-3 bg-plum text-white text-sm font-bold rounded-xl hover:bg-plum-900 transition-colors cursor-pointer shadow-md flex items-center gap-2"
                    >
                      <PhoneCall size={18} />
                      <span>Save Contact Details to DB</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DELIVERY & LOGISTICS SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <Truck size={24} className="text-plum" weight="bold" />
                  <span>Delivery Charge & Logistics Settings</span>
                </h2>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Configure delivery charges, tiered item rates, and free shipping thresholds for Online and COD orders.
                </p>
              </div>
              {cmsSaveStatus && (
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full animate-fade-in flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle size={16} weight="fill" />
                  <span>{cmsSaveStatus}</span>
                </span>
              )}
            </div>

            {/* 2-SUBTAB NAV SWITCHER */}
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3">
              <button
                type="button"
                onClick={() => setDeliverySubTab("online")}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  deliverySubTab === "online"
                    ? "bg-plum text-white shadow-sm ring-2 ring-purple-300"
                    : "bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/60"
                }`}
              >
                <CreditCard size={20} weight="bold" />
                <span>Online Delivery Settings</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    deliverySubTab === "online"
                      ? "bg-white/20 text-white"
                      : "bg-purple-200/60 text-purple-900"
                  }`}
                >
                  Prepaid / UPI
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliverySubTab("cod")}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  deliverySubTab === "cod"
                    ? "bg-plum text-white shadow-sm ring-2 ring-purple-300"
                    : "bg-purple-50/70 text-purple-950 hover:bg-purple-100 border border-purple-200/60"
                }`}
              >
                <Money size={20} weight="bold" />
                <span>COD Delivery Settings</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    deliverySubTab === "cod"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  Cash on Delivery
                </span>
              </button>
            </div>

            {/* SUB-TAB 1: ONLINE DELIVERY SETTINGS */}
            {deliverySubTab === "online" && (
              <div className="space-y-6 max-w-3xl animate-fade-in">
                <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 flex items-start gap-3">
                  <Info size={22} className="text-plum shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <div className="font-bold text-plum">Online & Prepaid Delivery Rules</div>
                    <div className="text-xs text-purple-800 mt-0.5">
                      Applied when customers pay via UPI, Razorpay, Debit/Credit Cards, or NetBanking. First item pays the base fee, and every additional item added to the bag adds the tiered incremental charge.
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Enable Online Payment (Prepaid)</div>
                    <div className="text-xs text-gray-500 font-medium">
                      If disabled, shoppers will only see Cash on Delivery (COD) payment options at checkout.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cms.delivery_settings?.online?.enabled !== false}
                      onChange={(e) =>
                        setCms({
                          ...cms,
                          delivery_settings: {
                            ...(cms.delivery_settings || {}),
                            online: {
                              ...(cms.delivery_settings?.online || {}),
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      1st Item of Product Delivery Charge (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-gray-500 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={cms.delivery_settings?.online?.firstItemFee ?? cms.delivery_settings?.standardFee ?? 79}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCms({
                            ...cms,
                            delivery_settings: {
                              ...(cms.delivery_settings || {}),
                              standardFee: val,
                              online: {
                                ...(cms.delivery_settings?.online || {}),
                                firstItemFee: val,
                              },
                            },
                          });
                        }}
                        className="w-full h-11 pl-8 pr-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-plum"
                        placeholder="79"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Base delivery charge when cart has exactly 1 product.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Additional Products Charges (₹ per extra item)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-gray-500 font-bold">+₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={cms.delivery_settings?.online?.additionalItemFee ?? 25}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCms({
                            ...cms,
                            delivery_settings: {
                              ...(cms.delivery_settings || {}),
                              online: {
                                ...(cms.delivery_settings?.online || {}),
                                additionalItemFee: val,
                              },
                            },
                          });
                        }}
                        className="w-full h-11 pl-10 pr-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-plum"
                        placeholder="25"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Charge added for each additional product (2nd item, 3rd item, etc.).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Free Delivery Minimum Order Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-gray-500 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={cms.delivery_settings?.online?.freeThreshold ?? cms.delivery_settings?.freeThreshold ?? 999}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCms({
                            ...cms,
                            delivery_settings: {
                              ...(cms.delivery_settings || {}),
                              freeThreshold: val,
                              online: {
                                ...(cms.delivery_settings?.online || {}),
                                freeThreshold: val,
                              },
                            },
                          });
                        }}
                        className="w-full h-11 pl-8 pr-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-plum"
                        placeholder="999"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Orders at or above this amount qualify for ₹0 Free Delivery.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Estimated Online Delivery Days
                    </label>
                    <input
                      type="text"
                      value={cms.delivery_settings?.online?.estimateDays || "3-5 Business Days"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCms({
                          ...cms,
                          delivery_settings: {
                            ...(cms.delivery_settings || {}),
                            estimateDays: val,
                            online: {
                              ...(cms.delivery_settings?.online || {}),
                              estimateDays: val,
                            },
                          },
                        });
                      }}
                      className="w-full h-11 px-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-plum"
                      placeholder="e.g. 3-5 Business Days"
                    />
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Shown to buyers during checkout and product delivery calculator.
                    </p>
                  </div>
                </div>

                {/* LIVE DYNAMIC SIMULATION FOR ONLINE */}
                {(() => {
                  const toSafeNumber = (value, fallback) => {
                    const num = Number(value);
                    return Number.isFinite(num) ? num : fallback;
                  };

                  const firstFee = toSafeNumber(
                    cms.delivery_settings?.online?.firstItemFee ?? cms.delivery_settings?.standardFee ?? 79,
                    79
                  );
                  const addFee = toSafeNumber(cms.delivery_settings?.online?.additionalItemFee ?? 25, 25);
                  const threshold = toSafeNumber(
                    cms.delivery_settings?.online?.freeThreshold ?? cms.delivery_settings?.freeThreshold ?? 999,
                    999
                  );

                  return (
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-2xl border border-purple-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-plum flex items-center gap-2">
                          <Sparkle size={18} weight="fill" className="text-amber-500" />
                          <span>Live Online Delivery Rate Preview</span>
                        </div>
                        <span className="text-xs font-semibold text-purple-700 bg-purple-100/80 px-2.5 py-1 rounded-full">
                          Timeline: {cms.delivery_settings?.online?.estimateDays || "3-5 Business Days"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                          <div className="text-gray-500 font-medium">1 Product Item</div>
                          <div className="text-base font-bold text-plum mt-0.5">₹{firstFee}</div>
                          <div className="text-xs text-gray-400">1st item base fee</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                          <div className="text-gray-500 font-medium">2 Product Items</div>
                          <div className="text-base font-bold text-plum mt-0.5">₹{firstFee + addFee}</div>
                          <div className="text-xs text-gray-400">₹{firstFee} + ₹{addFee}</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                          <div className="text-gray-500 font-medium">3 Product Items</div>
                          <div className="text-base font-bold text-plum mt-0.5">₹{firstFee + 2 * addFee}</div>
                          <div className="text-xs text-gray-400">₹{firstFee} + 2×₹{addFee}</div>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 shadow-xs">
                          <div className="text-emerald-800 font-medium">Order ≥ ₹{threshold}</div>
                          <div className="text-base font-bold text-emerald-700 mt-0.5">₹0 FREE</div>
                          <div className="text-xs text-emerald-600">Free shipping tier</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-TAB 2: COD DELIVERY SETTINGS */}
            {deliverySubTab === "cod" && (
              <div className="space-y-6 max-w-3xl animate-fade-in">
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-sm font-medium text-amber-950 flex items-start gap-3">
                  <Info size={22} className="text-amber-700 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <div className="font-bold text-amber-900">Cash on Delivery (COD) Rules</div>
                    <div className="text-xs text-amber-800 mt-0.5">
                      Applied when customer chooses to pay cash in hand upon physical parcel delivery. First item pays the COD base fee, and each additional item adds the specified extra charge.
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Enable Cash on Delivery (COD)</div>
                    <div className="text-xs text-gray-500 font-medium">
                      If disabled, shoppers will only see Online prepaid payment options at checkout.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cms.delivery_settings?.cod?.enabled !== false}
                      onChange={(e) =>
                        setCms({
                          ...cms,
                          delivery_settings: {
                            ...(cms.delivery_settings || {}),
                            cod: {
                              ...(cms.delivery_settings?.cod || {}),
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      1st Item of Product COD Delivery Charge (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-gray-500 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={cms.delivery_settings?.cod?.firstItemFee ?? 99}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCms({
                            ...cms,
                            delivery_settings: {
                              ...(cms.delivery_settings || {}),
                              cod: {
                                ...(cms.delivery_settings?.cod || {}),
                                firstItemFee: val,
                              },
                            },
                          });
                        }}
                        className="w-full h-11 pl-8 pr-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-plum"
                        placeholder="99"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Base COD delivery charge when cart has exactly 1 product.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Additional Products COD Charges (₹ per extra item)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-gray-500 font-bold">+₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={cms.delivery_settings?.cod?.additionalItemFee ?? 35}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCms({
                            ...cms,
                            delivery_settings: {
                              ...(cms.delivery_settings || {}),
                              cod: {
                                ...(cms.delivery_settings?.cod || {}),
                                additionalItemFee: val,
                              },
                            },
                          });
                        }}
                        className="w-full h-11 pl-10 pr-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-plum"
                        placeholder="35"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Charge added for each additional product in COD orders (2nd item, 3rd item, etc.).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Free COD Delivery Minimum Order Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-gray-500 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={cms.delivery_settings?.cod?.freeThreshold ?? 1499}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCms({
                            ...cms,
                            delivery_settings: {
                              ...(cms.delivery_settings || {}),
                              cod: {
                                ...(cms.delivery_settings?.cod || {}),
                                freeThreshold: val,
                              },
                            },
                          });
                        }}
                        className="w-full h-11 pl-8 pr-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-plum"
                        placeholder="1499"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Orders at or above this amount qualify for ₹0 Free COD delivery.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Estimated COD Delivery Days
                    </label>
                    <input
                      type="text"
                      value={cms.delivery_settings?.cod?.estimateDays || "4-7 Business Days"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCms({
                          ...cms,
                          delivery_settings: {
                            ...(cms.delivery_settings || {}),
                            cod: {
                              ...(cms.delivery_settings?.cod || {}),
                              estimateDays: val,
                            },
                          },
                        });
                      }}
                      className="w-full h-11 px-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-plum"
                      placeholder="e.g. 4-7 Business Days"
                    />
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Shown to buyers selecting COD on checkout.
                    </p>
                  </div>
                </div>

                {/* LIVE DYNAMIC SIMULATION FOR COD */}
                {(() => {
                  const toSafeNumber = (value, fallback) => {
                    const num = Number(value);
                    return Number.isFinite(num) ? num : fallback;
                  };

                  const firstFee = toSafeNumber(cms.delivery_settings?.cod?.firstItemFee ?? 99, 99);
                  const addFee = toSafeNumber(cms.delivery_settings?.cod?.additionalItemFee ?? 35, 35);
                  const threshold = toSafeNumber(cms.delivery_settings?.cod?.freeThreshold ?? 1499, 1499);

                  return (
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
                          <Sparkle size={18} weight="fill" className="text-amber-500" />
                          <span>Live COD Delivery Rate Preview</span>
                        </div>
                        <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full">
                          Timeline: {cms.delivery_settings?.cod?.estimateDays || "4-7 Business Days"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs">
                          <div className="text-gray-500 font-medium">1 Product Item</div>
                          <div className="text-base font-bold text-amber-900 mt-0.5">₹{firstFee}</div>
                          <div className="text-xs text-gray-400">1st item base fee</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs">
                          <div className="text-gray-500 font-medium">2 Product Items</div>
                          <div className="text-base font-bold text-amber-900 mt-0.5">₹{firstFee + addFee}</div>
                          <div className="text-xs text-gray-400">₹{firstFee} + ₹{addFee}</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs">
                          <div className="text-gray-500 font-medium">3 Product Items</div>
                          <div className="text-base font-bold text-amber-900 mt-0.5">₹{firstFee + 2 * addFee}</div>
                          <div className="text-xs text-gray-400">₹{firstFee} + 2×₹{addFee}</div>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 shadow-xs">
                          <div className="text-emerald-800 font-medium">Order ≥ ₹{threshold}</div>
                          <div className="text-base font-bold text-emerald-700 mt-0.5">₹0 FREE</div>
                          <div className="text-xs text-emerald-600">Free COD tier</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SAVE BUTTON */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const toSave = {
                    ...cms.delivery_settings,
                    standardFee: cms.delivery_settings?.online?.firstItemFee ?? cms.delivery_settings?.standardFee ?? 79,
                    freeThreshold: cms.delivery_settings?.online?.freeThreshold ?? cms.delivery_settings?.freeThreshold ?? 999,
                    estimateDays: cms.delivery_settings?.online?.estimateDays || "3-5 Business Days",
                  };
                  handleSaveCms("delivery_settings", toSave);
                }}
                className="px-7 py-3 bg-plum hover:bg-plum-900 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer text-sm flex items-center gap-2.5 hover:shadow-lg active:scale-95"
              >
                <Truck size={20} weight="bold" />
                <span>Save Delivery Settings to Database</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL (FULL SCREEN EXPANDED VIEW) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6">
          <div className="bg-white max-w-6xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[96vh] overflow-y-auto relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product to MySQL Database"}
                </h3>
                <p className="text-sm text-gray-500">Configure catalog details, R2 WebP images, color swatches, and size inventory.</p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: Basic Info, Category, Pricing, Specs, Description */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-plum uppercase tracking-wider border-b border-gray-100 pb-1.5">
                    Basic Info & Pricing
                  </h4>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const autoSlug = newName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                        setProductForm((prev) => ({
                          ...prev,
                          name: newName,
                          slug: editingProduct ? prev.slug : autoSlug,
                        }));
                      }}
                      className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                      placeholder="e.g. Kanchipuram Pure Silk Saree"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-bold text-gray-700">SEO URL Slug (Permalink)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoSlug = productForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                          setProductForm({ ...productForm, slug: autoSlug });
                        }}
                        className="text-xs font-bold text-plum hover:underline cursor-pointer"
                      >
                        ⚡ Generate from Title
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum font-mono bg-gray-50/50"
                      placeholder="e.g. kanchipuram-pure-silk-saree"
                    />
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      SEO Permalink: <span className="text-plum font-bold">/product/{productForm.slug || "your-product-slug"}</span>
                    </p>
                  </div>

                  {/* Category & Sub-Category Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Main Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setProductForm({ ...productForm, category: newCat, subcategory: "" });
                        }}
                        className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white font-medium"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat.id || cat.slug} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Sub-Category
                        {(() => {
                          const currentCatObj = categoriesList.find((c) => c.name?.toLowerCase() === productForm.category?.toLowerCase());
                          let subCount = 0;
                          try {
                            const subs = typeof currentCatObj?.subcategories === "string" ? JSON.parse(currentCatObj.subcategories) : (currentCatObj?.subcategories || []);
                            subCount = Array.isArray(subs) ? subs.length : 0;
                          } catch (e) {}
                          return subCount > 0 ? (
                            <span className="text-xs text-plum font-bold ml-1">({subCount} available)</span>
                          ) : null;
                        })()}
                      </label>
                      <select
                        value={productForm.subcategory || ""}
                        onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                        className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white font-medium"
                      >
                        <option value="">-- No Sub-Category (Main Only) --</option>
                        {(() => {
                          const currentCatObj = categoriesList.find((c) => c.name?.toLowerCase() === productForm.category?.toLowerCase());
                          let subList = [];
                          try {
                            subList = typeof currentCatObj?.subcategories === "string" ? JSON.parse(currentCatObj.subcategories) : (currentCatObj?.subcategories || []);
                          } catch (e) {}
                          if (!Array.isArray(subList)) subList = [];
                          return subList.map((sub, idx) => (
                            <option key={idx} value={sub}>
                              {sub}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                  </div>

                  {/* Fabric Details */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-bold text-gray-700">Fabric Details</label>
                      <span className="text-[11px] text-gray-400 font-medium">Click to select or type below</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-48 overflow-y-auto p-1.5 bg-gray-50/80 rounded-xl border border-gray-200">
                      {[
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
                      ].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, fabric: f })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            productForm.fabric === f
                              ? "bg-plum text-white border-plum shadow-xs font-black"
                              : "bg-white text-gray-700 border-gray-300 hover:border-plum hover:text-plum"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={productForm.fabric}
                      onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                      className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum bg-white"
                      placeholder="e.g. Cotton, Rayon, Mulmul Cotton, Chanderi Silk..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                        placeholder="2999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">MRP Price (₹)</label>
                      <input
                        type="number"
                        value={productForm.mrp}
                        onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                        className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                        placeholder="4999"
                      />
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Care & Wash Instructions</label>
                    <input
                      type="text"
                      value={productForm.care}
                      onChange={(e) => setProductForm({ ...productForm, care: e.target.value })}
                      className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                      placeholder="Dry clean recommended for first wash"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Description</label>
                    <textarea
                      rows={4}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                      placeholder="Detailed description of weave, fabric weight, and fit..."
                    />
                  </div>

                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="block text-xs font-black uppercase tracking-wider text-gray-500">
                      Homepage Showcase Sections
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer hover:text-plum transition-colors">
                        <input
                          type="checkbox"
                          checked={productForm.isNew}
                          onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                          className="w-4 h-4 rounded text-plum accent-plum cursor-pointer"
                        />
                        <span>Fresh Arrivals & New Weaves</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer hover:text-plum transition-colors">
                        <input
                          type="checkbox"
                          checked={productForm.isBestseller}
                          onChange={(e) => setProductForm({ ...productForm, isBestseller: e.target.checked })}
                          className="w-4 h-4 rounded text-plum accent-plum cursor-pointer"
                        />
                        <span>Most Loved Bestsellers</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Media Gallery & Color Palette Swatches */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-plum uppercase tracking-wider border-b border-gray-100 pb-1.5">
                    Media Gallery & Visual Swatches
                  </h4>

                  {/* Main Cover Image Upload with Delete Option */}
                  <ImageUploadInput
                    label="Main Cover Image (Cloudflare R2 + WebP Optimized)"
                    recommendedSize="600 × 800 px (3:4 Portrait)"
                    value={productForm.imageUrl}
                    onChange={(url) => setProductForm({ ...productForm, imageUrl: url })}
                    onRemove={() => setProductForm({ ...productForm, imageUrl: "" })}
                  />

                  {/* Gallery Images Upload with Delete Options */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-gray-800">
                        Additional Gallery Images (Cloudflare R2)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            imagesList: [...productForm.imagesList, ""],
                          })
                        }
                        className="text-xs font-bold text-plum hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Gallery Slot</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {productForm.imagesList.map((imgUrl, gIdx) => (
                        <div key={gIdx} className="relative">
                          <ImageUploadInput
                            label={`Gallery #${gIdx + 2}`}
                            recommendedSize="600 × 800 px (3:4 Portrait)"
                            value={imgUrl}
                            onChange={(url) => {
                              const updated = [...productForm.imagesList];
                              updated[gIdx] = url;
                              setProductForm({ ...productForm, imagesList: updated });
                            }}
                            onRemove={() => {
                              if (productForm.imagesList.length > 1 && !imgUrl) {
                                const updated = productForm.imagesList.filter((_, i) => i !== gIdx);
                                setProductForm({ ...productForm, imagesList: updated });
                              } else {
                                const updated = [...productForm.imagesList];
                                updated[gIdx] = "";
                                setProductForm({ ...productForm, imagesList: updated });
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COLOR PALETTE & OCCASION SWATCHES */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3.5">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1.5">Color Palette Swatches</label>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {["Gold", "Red", "Maroon", "Teal", "Royal Blue", "Emerald Green", "Pink", "Black", "White", "Purple", "Yellow"].map((c) => {
                          const selected = (productForm.colorsStr || "").toLowerCase().includes(c.toLowerCase());
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                const currentArr = productForm.colorsStr ? productForm.colorsStr.split(",").map(s => s.trim()).filter(Boolean) : [];
                                if (selected) {
                                  const updated = currentArr.filter(x => x.toLowerCase() !== c.toLowerCase());
                                  setProductForm({ ...productForm, colorsStr: updated.join(", ") });
                                } else {
                                  const updated = [...currentArr, c];
                                  setProductForm({ ...productForm, colorsStr: updated.join(", ") });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                selected ? "bg-plum text-white border-plum shadow-2xs font-extrabold" : "bg-white text-gray-700 border-gray-300 hover:border-plum"
                              }`}
                            >
                              {selected ? "✓ " : "+ "}{c}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Colors List (comma separated)</label>
                          <input
                            type="text"
                            value={productForm.colorsStr}
                            onChange={(e) => setProductForm({ ...productForm, colorsStr: e.target.value })}
                            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-plum"
                            placeholder="Gold, Red, Green"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Occasions List (comma separated)</label>
                          <input
                            type="text"
                            value={productForm.occasionStr}
                            onChange={(e) => setProductForm({ ...productForm, occasionStr: e.target.value })}
                            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-plum"
                            placeholder="Festive, Party Wear"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEPARATE FULL-WIDTH SECTION: COLOR & SIZE VARIANT INVENTORY (NO INTERNAL SCROLL) */}
              <div className="bg-gray-50/70 rounded-2xl border-2 border-purple-200/80 p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                        <span>⚡ Color & Size Variant Stock Maintenance</span>
                      </h4>
                      <span className="text-xs font-bold bg-plum text-white px-2.5 py-0.5 rounded-full">
                        {productForm.sizesList.length} Lines
                      </span>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        Total Units: {productForm.sizesList.reduce((sum, s) => sum + (parseInt(s.stock, 10) || 0), 0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Full separate section with no internal scroll. Auto-generate size variants or add custom inventory combinations.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateVariants(["S", "M", "L", "XL", "XXL"])}
                      className="px-3 py-1.5 bg-plum/10 text-plum hover:bg-plum hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-plum/30 shadow-2xs"
                      title="Generate S, M, L, XL, XXL for each selected color"
                    >
                      ⚡ Auto-Gen (S-XXL)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateVariants(["34", "36", "38", "40", "42"])}
                      className="px-3 py-1.5 bg-plum/10 text-plum hover:bg-plum hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-plum/30 shadow-2xs"
                      title="Generate 34, 36, 38, 40, 42 for each selected color"
                    >
                      ⚡ Auto-Gen (34-42)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateVariants(["44", "46", "48", "50", "52", "54", "56"])}
                      className="px-3 py-1.5 bg-purple-700 text-white hover:bg-purple-850 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      title="Generate 44, 46, 48, 50, 52, 54, 56 for each selected color"
                    >
                      ⚡ Auto-Gen (44-56)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateVariants(["Free Size"])}
                      className="px-3 py-1.5 bg-plum/10 text-plum hover:bg-plum hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-plum/30 shadow-2xs"
                      title="Generate Free Size for each selected color"
                    >
                      ⚡ Free Size
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          sizesList: [
                            ...productForm.sizesList,
                            { label: "M", color: (productForm.colorsStr || "").split(",")[0]?.trim() || "", stock: 10, price: productForm.price || "" },
                          ],
                        })
                      }
                      className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold transition-all cursor-pointer border border-gray-300 shadow-2xs"
                    >
                      + Add Line
                    </button>
                    {productForm.sizesList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, sizesList: [] })}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-all cursor-pointer border border-red-200"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Variant Table (NO SCROLL CONTAINER) */}
                {productForm.sizesList.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300 text-sm">
                    No variants added. Click any Auto-Gen button above (e.g. <strong>34-42</strong>, <strong>44-56</strong>, or <strong>S-XXL</strong>) to generate stock lines!
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-2xs">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-xs">
                        <tr>
                          <th className="py-2.5 px-3 w-32">Size (Label)</th>
                          <th className="py-2.5 px-3">Color Variant</th>
                          <th className="py-2.5 px-3 w-36">In-Stock Qty</th>
                          <th className="py-2.5 px-3 w-40">Price Override (₹)</th>
                          <th className="py-2.5 px-3 w-16 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {productForm.sizesList.map((sz, sIdx) => {
                          const stockNum = parseInt(sz.stock, 10) || 0;
                          return (
                            <tr key={sIdx} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="e.g. 44"
                                  value={sz.label}
                                  onChange={(e) => {
                                    const updated = [...productForm.sizesList];
                                    updated[sIdx].label = e.target.value;
                                    setProductForm({ ...productForm, sizesList: updated });
                                  }}
                                  className="w-full h-9 px-3 border border-gray-300 rounded-lg bg-white font-bold text-sm focus:outline-none focus:border-plum"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  placeholder="e.g. Navy Blue"
                                  value={sz.color || ""}
                                  onChange={(e) => {
                                    const updated = [...productForm.sizesList];
                                    updated[sIdx].color = e.target.value;
                                    setProductForm({ ...productForm, sizesList: updated });
                                  }}
                                  className="w-full h-9 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-plum"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={sz.stock}
                                    onChange={(e) => {
                                      const updated = [...productForm.sizesList];
                                      updated[sIdx].stock = parseInt(e.target.value || "0", 10);
                                      setProductForm({ ...productForm, sizesList: updated });
                                    }}
                                    className={`w-24 h-9 px-2.5 border rounded-lg text-sm font-bold text-center focus:outline-none focus:border-plum ${
                                      stockNum <= 0 ? "border-red-300 bg-red-50 text-red-700" : "border-gray-300 bg-white text-gray-900"
                                    }`}
                                  />
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${stockNum <= 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                                    {stockNum <= 0 ? "Out" : "In"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  placeholder={`₹${productForm.price || "Price"}`}
                                  value={sz.price || ""}
                                  onChange={(e) => {
                                    const updated = [...productForm.sizesList];
                                    updated[sIdx].price = e.target.value;
                                    setProductForm({ ...productForm, sizesList: updated });
                                  }}
                                  className="w-full h-9 px-3 border border-gray-300 rounded-lg bg-white text-sm font-bold text-emerald-800 focus:outline-none focus:border-plum"
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = productForm.sizesList.filter((_, i) => i !== sIdx);
                                    setProductForm({ ...productForm, sizesList: updated });
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Line"
                                >
                                  <Trash size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-plum text-white rounded-xl hover:bg-plum-900 transition-colors shadow-sm cursor-pointer"
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
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCategoryModal(false);
          }}
        >
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-modal-pop">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingCategory ? "Edit Category" : "Add Category to DB"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure category permalink, display banner, and sub-collections
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const autoSlug = newName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                      setCategoryForm((prev) => ({
                        ...prev,
                        name: newName,
                        slug: editingCategory ? prev.slug : autoSlug,
                      }));
                    }}
                    className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                    placeholder="e.g. Sarees"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700">SEO URL Slug (Permalink)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoSlug = categoryForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                        setCategoryForm({ ...categoryForm, slug: autoSlug });
                      }}
                      className="text-xs font-bold text-plum hover:underline cursor-pointer"
                    >
                      ⚡ Generate from Name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum font-mono bg-gray-50/50"
                    placeholder="e.g. sarees"
                  />
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    SEO Permalink: <span className="text-plum font-bold">/shop?category={categoryForm.slug || "category-slug"}</span>
                  </p>
                </div>

                <ImageUploadInput
                  label="Category Display Image (Cloudflare R2 + WebP Optimized)"
                  recommendedSize="400 × 510 px (1:1.26 Arched Dome Ratio)"
                  placeholder="e.g. 400 × 510 px arched image URL or upload above"
                  value={categoryForm.image}
                  onChange={(url) => setCategoryForm({ ...categoryForm, image: url })}
                />

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                    placeholder="1 sentence summary..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Sub-Categories (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(categoryForm.subcategories) ? categoryForm.subcategories.join(", ") : (categoryForm.subcategories || "")}
                    onChange={(e) => {
                      const list = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                      setCategoryForm({ ...categoryForm, subcategories: list });
                    }}
                    className="w-full h-11 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-plum"
                    placeholder="e.g. Silk Sarees, Cotton Sarees, Handloom Sarees, Party Wear"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter sub-categories separated by commas. These will be shown under this category in the header navigation drawer!
                  </p>
                  {Array.isArray(categoryForm.subcategories) && categoryForm.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {categoryForm.subcategories.map((sub, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-plum/10 text-plum text-xs font-bold px-2.5 py-1 rounded-md">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer with Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200/70 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
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
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto relative border border-gray-200">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 flex-wrap">
              <span className="bg-plum/10 text-plum font-bold text-sm px-3 py-1 rounded-full uppercase">
                {viewingProduct.category}
              </span>
              {viewingProduct.subcategory && (
                <span className="bg-purple-100 text-purple-800 font-semibold text-sm px-3 py-1 rounded-full">
                  {viewingProduct.subcategory}
                </span>
              )}
              {viewingProduct.isNew && (
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✦ Fresh Arrivals & New Weaves
                </span>
              )}
              {viewingProduct.isBestseller && (
                <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
                  ★ Most Loved Bestsellers
                </span>
              )}
              <span className="text-xs text-gray-400 font-mono">ID: {viewingProduct.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Gallery Images Preview */}
              <div className="space-y-3">
                <img
                  src={normalizeImageUrl(viewingProduct.images?.[0]) || "/logo.png"}
                  alt={viewingProduct.name}
                  className="w-full h-64 object-cover rounded-xl border border-gray-200 shadow-xs"
                  onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                />
                {viewingProduct.images?.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={normalizeImageUrl(img) || "/logo.png"}
                        alt={`Gallery ${i + 1}`}
                        className="w-14 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                        onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Summary */}
              <div className="space-y-3 text-sm">
                <h3 className="text-xl font-black text-gray-900 leading-snug">{viewingProduct.name}</h3>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-gray-900">₹{viewingProduct.price}</span>
                    {viewingProduct.mrp && (
                      <span className="text-sm text-gray-400 line-through ml-2">₹{viewingProduct.mrp}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Rating: {viewingProduct.rating?.avg || "4.6"} ★ ({viewingProduct.rating?.count || "94"})
                  </span>
                </div>

                {viewingProduct.fabric && (
                  <div>
                    <strong className="text-gray-900 block font-bold mb-0.5">Fabric Details:</strong>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{viewingProduct.fabric}</p>
                  </div>
                )}

                {viewingProduct.care && (
                  <div>
                    <strong className="text-gray-900 block font-bold mb-0.5">Care Instructions:</strong>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{viewingProduct.care}</p>
                  </div>
                )}

                {/* Colors */}
                {viewingProduct.colors?.length > 0 && (
                  <div>
                    <strong className="text-gray-900 block font-bold mb-1">Color Options:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingProduct.colors.map((c, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md font-semibold border border-gray-200 text-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes & Stock */}
                {viewingProduct.sizes?.length > 0 && (
                  <div>
                    <strong className="text-gray-900 block font-bold mb-1">Sizes & Stock Levels:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingProduct.sizes.map((s, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-md border text-xs font-bold ${
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
                    <strong className="text-gray-900 block font-bold mb-0.5">Description:</strong>
                    <p className="text-gray-600 leading-relaxed max-h-24 overflow-y-auto">{viewingProduct.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleDuplicateProduct(viewingProduct);
                }}
                className="px-4 py-2.5 text-sm font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Copy size={16} /> Duplicate Product
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenEditProduct(viewingProduct);
                }}
                className="px-4 py-2.5 text-sm font-bold bg-plum text-white rounded-xl hover:bg-plum-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Pencil size={16} /> Edit Product
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
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
            <div className="flex items-center justify-between border-b border-gray-200 pb-3.5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">Order ID: {viewingOrder.id || viewingOrder.orderNumber}</span>
                  {/* Online / COD Payment Badge */}
                  <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                    (viewingOrder.paymentMethod || viewingOrder.payment_method || "").toLowerCase() === "cod"
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border-emerald-300"
                  }`}>
                    {(viewingOrder.paymentMethod || viewingOrder.payment_method || "").toLowerCase() === "cod"
                      ? "💵 Cash on Delivery (COD)"
                      : "💳 Online Payment (Razorpay / UPI)"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-plum">Order #{viewingOrder.orderNumber}</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Placed on {new Date(viewingOrder.createdAt || viewingOrder.created_at || Date.now()).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" })}
                </p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Status Controls */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Dispatch Order Status</label>
                <select
                  value={viewingOrder.orderStatus || viewingOrder.order_status || "confirmed"}
                  onChange={(e) => handleUpdateOrderStatus(viewingOrder.orderNumber || viewingOrder.id, e.target.value, viewingOrder.paymentStatus || viewingOrder.payment_status)}
                  className="w-full h-11 px-3.5 font-bold border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-plum text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                  <option value="replaced">Replaced</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Status</label>
                <select
                  value={viewingOrder.paymentStatus || viewingOrder.payment_status || ((viewingOrder.paymentMethod || viewingOrder.payment_method) === "cod" ? "pending" : "paid")}
                  onChange={(e) => handleUpdateOrderStatus(viewingOrder.orderNumber || viewingOrder.id, viewingOrder.orderStatus || viewingOrder.order_status, e.target.value)}
                  className="w-full h-11 px-3.5 font-bold border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-plum text-sm"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold uppercase text-xs tracking-wider text-plum border-b border-gray-100 pb-1">
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors mt-2 cursor-pointer shadow-xs"
                      >
                        Chat on WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold uppercase text-xs tracking-wider text-plum border-b border-gray-100 pb-1">
                      Shipping Delivery Address
                    </h4>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {sLine1 ? `${sLine1}, ` : ""}{sCity ? `${sCity}, ` : ""}{sState ? `${sState} - ` : ""}<strong>{sPin}</strong><br />
                      <span className="inline-block mt-1 bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded border border-gray-200 uppercase">
                        Address Tag: {sTag}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Line Items Table */}
            <div className="space-y-3 text-sm">
              <h4 className="font-bold uppercase text-xs tracking-wider text-plum">
                Itemized Order Summary ({viewingOrder.items?.length || 0})
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-xs">
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
                              src={normalizeImageUrl(item.image || item.images?.[0]) || "/logo.png"}
                              alt={item.name}
                              className="w-11 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                              onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                            />
                            <div>
                              <div className="font-bold text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-400 font-mono">₹{item.price} each</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-700">
                          <div>Size: <strong>{item.size || "Free"}</strong></div>
                          {item.color && <div className="text-gray-500 text-xs">Color: {item.color}</div>}
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900">{item.qty}</td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Pricing Calculation - Robust Fallback Math */}
            {(() => {
              const itemsList = viewingOrder.items || [];
              const calculatedSubtotal = itemsList.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.qty || 1)), 0);
              const subtotalNum = viewingOrder.subtotal !== undefined && viewingOrder.subtotal !== null
                ? parseFloat(viewingOrder.subtotal)
                : viewingOrder.sub_total !== undefined
                ? parseFloat(viewingOrder.sub_total)
                : calculatedSubtotal;

              const isCod = (viewingOrder.paymentMethod || viewingOrder.payment_method || "").toLowerCase() === "cod";
              
              const shippingFeeNum = viewingOrder.shippingFee !== undefined && viewingOrder.shippingFee !== null
                ? parseFloat(viewingOrder.shippingFee)
                : viewingOrder.shipping_fee !== undefined
                ? parseFloat(viewingOrder.shipping_fee)
                : (subtotalNum >= 999 ? 0 : 79);

              const codFeeNum = viewingOrder.codFee !== undefined && viewingOrder.codFee !== null
                ? parseFloat(viewingOrder.codFee)
                : viewingOrder.cod_fee !== undefined
                ? parseFloat(viewingOrder.cod_fee)
                : (isCod ? 49 : 0);

              const totalAmountNum = viewingOrder.totalAmount !== undefined && viewingOrder.totalAmount !== null
                ? parseFloat(viewingOrder.totalAmount)
                : viewingOrder.total_amount !== undefined
                ? parseFloat(viewingOrder.total_amount)
                : viewingOrder.total !== undefined
                ? parseFloat(viewingOrder.total)
                : (subtotalNum + shippingFeeNum + codFeeNum);

              return (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-sm text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal:</span>
                    <span>₹{subtotalNum.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Delivery Fee:</span>
                    <span>{shippingFeeNum === 0 ? "FREE" : `₹${shippingFeeNum.toLocaleString("en-IN")}`}</span>
                  </div>
                  {codFeeNum > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Cash on Delivery Handling Fee:</span>
                      <span>₹{codFeeNum.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black text-plum pt-2.5 border-t border-gray-200">
                    <span>Grand Total Amount:</span>
                    <span>₹{totalAmountNum.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })()}

            {/* Return & Replacement History Log section */}
            {(viewingOrder.returnHistory || viewingOrder.return_history) &&
              (Array.isArray(viewingOrder.returnHistory) ? viewingOrder.returnHistory : (typeof viewingOrder.return_history === "string" ? JSON.parse(viewingOrder.return_history) : []))?.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-purple-50/80 border border-red-200 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-extrabold text-gray-900">
                      <ArrowUDownLeft size={18} className="text-plum shrink-0" />
                      <span>Order Return & Replacement History Log</span>
                    </div>
                    <span className="bg-plum/10 text-plum text-xs font-black px-2.5 py-0.5 rounded-full border border-plum/20 uppercase">
                      Audit Trail
                    </span>
                  </div>
                  <div className="space-y-3 divide-y divide-gray-200/80 pt-1">
                    {(Array.isArray(viewingOrder.returnHistory)
                      ? viewingOrder.returnHistory
                      : (typeof viewingOrder.return_history === "string" ? JSON.parse(viewingOrder.return_history) : [])
                    ).map((log, lIdx) => {
                      const isReplacement = log.type === "replacement" || log.id?.startsWith("REP");
                      return (
                        <div key={lIdx} className="pt-2.5 first:pt-0 space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                            <span className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-xs uppercase font-black tracking-wider ${isReplacement ? "bg-purple-100 text-purple-900 border border-purple-300" : "bg-red-100 text-red-900 border border-red-300"}`}>
                                {isReplacement ? "🔄 Replacement" : "↩️ Return"}
                              </span>
                              <span>Reason: <strong className="text-gray-900 font-extrabold">{log.reason || "Customer Request"}</strong></span>
                            </span>
                            <span className="text-gray-500 font-mono text-xs">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : ""}
                            </span>
                          </div>

                          {isReplacement ? (
                            <div className="text-xs bg-white p-2.5 rounded-lg border border-purple-200 font-medium text-purple-950 space-y-0.5 shadow-2xs">
                              <div>Returned Item: <strong className="font-bold">{log.returnedItem?.name || log.returnedItemId || "Product"}</strong> ({log.returnedItem?.size || ""})</div>
                              <div>Replacement Unit: <strong className="font-bold text-plum">{log.replacementItem?.name || log.replacementProductId || "Product"}</strong> (Size: {log.replacementSize || log.replacementItem?.size}, Color: {log.replacementColor || log.replacementItem?.color || "Standard"}) × {log.qty || log.replacementItem?.qty || 1} unit</div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {log.items?.map((it, iIdx) => (
                                <span key={iIdx} className="bg-white text-red-900 text-xs px-2.5 py-1 rounded-lg border border-red-200 font-semibold shadow-2xs">
                                  {it.name || "Item"} ({it.size || "Free Size"}{it.color ? `, ${it.color}` : ""}) × {it.returnQty || it.qty || 1} returned unit(s)
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Footer Action Buttons with Return & Replace */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/invoice/${viewingOrder.orderNumber || viewingOrder.id}`}
                  target="_blank"
                  className="px-4 py-2.5 text-sm font-bold bg-plum/10 text-plum hover:bg-plum/20 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-plum/30"
                  title="Download and print full Tax Invoice PDF"
                >
                  <FileText size={16} /> Tax Invoice
                </Link>

                <button
                  type="button"
                  onClick={() => handleSendInvoiceToPhone(viewingOrder)}
                  className="px-4 py-2.5 text-sm font-bold bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-green-200"
                  title="Send Invoice to customer via WhatsApp"
                >
                  <WhatsappLogo size={16} weight="fill" /> WhatsApp Invoice
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOrderModal(false);
                    handleOpenReturnModal(viewingOrder);
                  }}
                  className="px-4 py-2.5 text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-red-200"
                  title="Return items and restore stock to inventory"
                >
                  <ArrowUDownLeft size={16} /> Process Return
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenReplaceModal(viewingOrder)}
                  className="px-4 py-2.5 text-sm font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-purple-200"
                  title="Process item replacement with size/color stock validation"
                >
                  <ArrowsClockwise size={16} /> Process Replacement
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteOrder(viewingOrder.orderNumber || viewingOrder.id)}
                  className="px-3.5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash size={16} /> Delete
                </button>

                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-6 py-2.5 text-sm font-bold bg-plum text-white hover:bg-plum-900 rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER REPLACEMENT MODAL WITH PRODUCT, COLOR & SIZE SELECTION & STOCK VALIDATION */}
      {showReplaceModal && viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6 sm:p-7 space-y-4 relative border border-gray-200 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Process Item Replacement</h3>
                <p className="text-xs sm:text-sm text-gray-500">Order #{viewingOrder.orderNumber} · Auto-adjusts stock for returned & replacement items</p>
              </div>
              <button
                onClick={() => setShowReplaceModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitReplaceOrder} className="space-y-4 text-sm">
              {/* Reason for Replacement */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-sm">Reason for Replacement / Exchange</label>
                <select
                  value={replaceForm.reason || "Size / Fitting Issue Exchange"}
                  onChange={(e) => setReplaceForm({ ...replaceForm, reason: e.target.value })}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-xl bg-white font-medium focus:outline-none focus:border-plum text-sm"
                >
                  <option value="Size / Fitting Issue Exchange">Size / Fitting Issue Exchange</option>
                  <option value="Defective / Damaged Item Replacement">Defective / Damaged Item Replacement</option>
                  <option value="Color / Design Preference Exchange">Color / Design Preference Exchange</option>
                  <option value="Wrong Item Replacement">Wrong Item Replacement</option>
                  <option value="Other Replacement Reason">Other Replacement Reason</option>
                </select>
              </div>

              {/* Select Item to Return */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-sm">Select Returned Item (Stock will be restored +1)</label>
                <select
                  value={replaceForm.returnItemId}
                  onChange={(e) => setReplaceForm({ ...replaceForm, returnItemId: e.target.value })}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-xl bg-white font-medium text-sm"
                >
                  {viewingOrder.items?.map((item, i) => (
                    <option key={i} value={item.id}>
                      {item.name} ({item.size || "Free"} {item.color || ""}) - ₹{item.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Replacement Product */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 text-sm">Select Replacement Product</label>
                <select
                  value={replaceForm.replacementProductId}
                  onChange={(e) => setReplaceForm({ ...replaceForm, replacementProductId: e.target.value })}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-xl bg-white font-medium text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) - ₹{p.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Replacement Size & Color inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-sm">Replacement Size</label>
                  <input
                    type="text"
                    required
                    value={replaceForm.replacementSize}
                    onChange={(e) => setReplaceForm({ ...replaceForm, replacementSize: e.target.value })}
                    className="w-full h-11 px-3.5 border border-gray-300 rounded-xl font-bold text-sm"
                    placeholder="e.g. M or 36"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1 text-sm">Replacement Color</label>
                  <input
                    type="text"
                    value={replaceForm.replacementColor}
                    onChange={(e) => setReplaceForm({ ...replaceForm, replacementColor: e.target.value })}
                    className="w-full h-11 px-3.5 border border-gray-300 rounded-xl font-medium text-sm"
                    placeholder="e.g. Red / Gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-sm">Replacement Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={replaceForm.qty}
                  onChange={(e) => setReplaceForm({ ...replaceForm, qty: parseInt(e.target.value || "1", 10) })}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-xl font-bold text-sm"
                />
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs leading-relaxed">
                ⚡ <strong>Stock Validation & Adjustment:</strong> Submitting will return stock (+{replaceForm.qty}) for the original item and deduct stock (-{replaceForm.qty}) for the selected replacement size & color variant.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowsClockwise size={16} /> Process Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN ORDER QUANTITY SELECTOR MODAL */}
      {showReturnModal && viewingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-line space-y-4 font-sans text-left">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="font-black text-lg text-gray-900">Process Return for Order #{viewingOrder.orderNumber || viewingOrder.id}</h3>
                <p className="text-xs sm:text-sm text-gray-500">Select items & return quantity to add back to product inventory stock.</p>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              {/* Return Reason Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-plum"
                >
                  <option value="Size / Fitting Issue">Size / Fitting Issue</option>
                  <option value="Damaged / Defective Item">Damaged / Defective Item</option>
                  <option value="Color / Fabric Difference">Color / Fabric Difference</option>
                  <option value="Customer Cancelled Order">Customer Cancelled Order</option>
                  <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                  <option value="Other Reason">Other Reason</option>
                </select>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {returnItemsState.map((item, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${item.selected ? "border-plum bg-plum/5" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setReturnItemsState((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, selected: val } : it))
                          );
                        }}
                        className="w-4 h-4 rounded text-plum cursor-pointer shrink-0"
                      />
                      <img src={item.image || "/logo.png"} alt={item.name} className="w-11 h-13 object-cover rounded-lg border border-gray-200 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 font-medium">
                          Size: <span className="font-semibold text-gray-800">{item.size}</span>
                          {item.color ? <span> • Color: <span className="font-semibold text-gray-800">{item.color}</span></span> : null}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">₹{item.price} (Ordered: {item.maxQty})</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Return Qty</label>
                      <select
                        disabled={!item.selected}
                        value={item.returnQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setReturnItemsState((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, returnQty: val } : it))
                          );
                        }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white font-bold focus:outline-none focus:border-plum"
                      >
                        {Array.from({ length: item.maxQty }, (_, i) => i + 1).map((q) => (
                          <option key={q} value={q}>
                            {q} {q === 1 ? "unit" : "units"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center text-sm">
                <span className="font-bold text-gray-700">Total Returned Stock Qty:</span>
                <span className="font-black text-plum text-base">
                  {returnItemsState.filter((i) => i.selected).reduce((sum, i) => sum + i.returnQty, 0)} units
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-plum text-white hover:bg-plum-900 font-bold rounded-xl text-sm cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowUDownLeft size={16} />
                  <span>Confirm & Restore Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THEME DESIGNED ALERT / CONFIRM POPUP MODAL */}
      {toastModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-4 font-sans text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {toastModal.type === "success" && (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-base">
                    ✓
                  </div>
                )}
                {toastModal.type === "warning" && (
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-base">
                    !
                  </div>
                )}
                {(toastModal.type === "error" || toastModal.type === "confirm") && (
                  <div className="w-10 h-10 rounded-full bg-plum/10 text-plum flex items-center justify-center shrink-0 font-bold text-base">
                    ?
                  </div>
                )}
                <h3 className="font-black text-lg text-gray-900">{toastModal.title}</h3>
              </div>
              <button
                onClick={() => setToastModal((prev) => ({ ...prev, open: false }))}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
              {toastModal.message}
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              {toastModal.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setToastModal((prev) => ({ ...prev, open: false }))}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const action = toastModal.onConfirm;
                      setToastModal((prev) => ({ ...prev, open: false }));
                      if (action) action();
                    }}
                    className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl text-sm cursor-pointer shadow-xs transition-colors"
                  >
                    Confirm Action
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setToastModal((prev) => ({ ...prev, open: false }))}
                  className="px-6 py-2.5 bg-plum text-white hover:bg-plum-900 font-bold rounded-xl text-sm cursor-pointer shadow-xs transition-colors"
                >
                  OK, Understood
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

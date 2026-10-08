import { pool, isConnected } from "../config/db.js";
import { seedProducts } from "../seed/seedData.js";

// Memory storage for dev mode when DB is not connected
const inMemoryOrders = [];

// POST /api/orders
export async function createOrder(req, res) {
  try {
    const { items, shippingAddress, paymentMethod = "online" } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.email ||
      !shippingAddress.line1 ||
      !shippingAddress.pin
    ) {
      return res.status(400).json({ success: false, message: "Complete shipping address and contact details required." });
    }

    let calculatedSubtotal = 0;
    const processedItems = [];

    // Recalculate prices on server side to prevent client payload manipulation
    for (const item of items) {
      let product = null;

      if (pool && isConnected) {
        const [rows] = await pool.query(
          "SELECT id, name, slug, price, mrp, images FROM products WHERE id = ? OR slug = ? LIMIT 1",
          [item.id, item.slug || item.id]
        );
        if (rows.length > 0) {
          const r = rows[0];
          const imgs = typeof r.images === "string" ? JSON.parse(r.images) : r.images;
          product = {
            id: r.id,
            name: r.name,
            slug: r.slug,
            price: parseFloat(r.price),
            mrp: r.mrp ? parseFloat(r.mrp) : null,
            image: imgs?.[0]?.url || "/logo.png",
          };
        }
      }

      if (!product) {
        product = seedProducts.find((p) => p.id === item.id || p.slug === item.slug) || {
          id: item.id,
          name: item.name || "Custom Boutique Item",
          price: item.price || 999,
          mrp: item.mrp || 1999,
          image: item.image || "/logo.png",
        };
      }

      const qty = parseInt(item.qty || item.quantity || 1);
      const itemSubtotal = product.price * qty;
      calculatedSubtotal += itemSubtotal;

      processedItems.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        mrp: product.mrp,
        size: item.size || "Free Size",
        color: item.color || "",
        qty: qty,
        image: product.image || item.image || "/logo.png",
        customStitching: item.customStitching || null,
      });
    }

    const shippingFee = calculatedSubtotal >= 999 ? 0 : 79;
    const codFee = paymentMethod === "cod" ? 49 : 0;
    const grandTotal = calculatedSubtotal + shippingFee + codFee;

    const orderNumber = `AGAL-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderNumber,
      customerName: shippingAddress.name,
      customerPhone: shippingAddress.phone,
      customerEmail: shippingAddress.email,
      shippingAddress,
      subtotal: calculatedSubtotal,
      shippingFee,
      codFee,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "confirmed",
      items: processedItems,
      createdAt: new Date().toISOString(),
    };

    if (!pool || !isConnected) {
      inMemoryOrders.unshift(orderData);
      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        orderNumber,
        order: orderData,
      });
    }

    await pool.query(
      `INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, shipping_address, subtotal, shipping_fee, cod_fee, total_amount, payment_method, payment_status, order_status, items)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        shippingAddress.name,
        shippingAddress.phone,
        shippingAddress.email,
        JSON.stringify(shippingAddress),
        calculatedSubtotal,
        shippingFee,
        codFee,
        grandTotal,
        paymentMethod,
        paymentMethod === "cod" ? "pending" : "pending",
        "confirmed",
        JSON.stringify(processedItems),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderNumber,
      order: orderData,
    });
  } catch (err) {
    console.error("Error in createOrder:", err);
    res.status(500).json({ success: false, message: "Failed to process order" });
  }
}

// GET /api/orders/:orderNumber
export async function getOrder(req, res) {
  try {
    const { orderNumber } = req.params;

    if (!pool || !isConnected) {
      const order = inMemoryOrders.find((o) => o.orderNumber === orderNumber);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      return res.json({ success: true, order });
    }

    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE order_number = ? LIMIT 1",
      [orderNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const r = rows[0];
    let addr = {};
    try {
      addr = typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address) : (r.shipping_address || {});
    } catch (e) {
      addr = {};
    }

    let items = [];
    try {
      items = typeof r.items === "string" ? JSON.parse(r.items) : (r.items || []);
    } catch (e) {
      items = [];
    }

    const cName = r.customer_name || addr.name || addr.customerName || "Boutique Customer";
    const cPhone = r.customer_phone || addr.phone || addr.customerPhone || "";
    const cEmail = r.customer_email || addr.email || addr.customerEmail || "";

    const order = {
      id: r.id,
      orderNumber: r.order_number,
      customerName: cName,
      customerPhone: cPhone,
      customerEmail: cEmail,
      shippingAddress: {
        name: addr.name || cName,
        phone: addr.phone || cPhone,
        email: addr.email || cEmail,
        line1: addr.line1 || addr.address || addr.street || "",
        city: addr.city || "",
        state: addr.state || "",
        pin: addr.pin || addr.pincode || addr.zip || "",
        tag: addr.tag || "Home",
      },
      subtotal: parseFloat(r.subtotal || 0),
      shippingFee: parseFloat(r.shipping_fee || 0),
      codFee: parseFloat(r.cod_fee || 0),
      totalAmount: parseFloat(r.total_amount || 0),
      paymentMethod: r.payment_method || "online",
      paymentStatus: r.payment_status || "pending",
      orderStatus: r.order_status || "confirmed",
      items: Array.isArray(items) ? items : [],
      createdAt: r.created_at || new Date().toISOString(),
    };

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error in getOrder:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
}

// GET /api/orders (Admin Only)
export async function getAllOrders(req, res) {
  try {
    if (!pool || !isConnected) {
      return res.json({ success: true, count: inMemoryOrders.length, orders: inMemoryOrders });
    }

    const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100");
    const formatted = rows.map((r) => {
      let addr = {};
      try {
        addr = typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address) : (r.shipping_address || {});
      } catch (e) {
        addr = {};
      }

      let items = [];
      try {
        items = typeof r.items === "string" ? JSON.parse(r.items) : (r.items || []);
      } catch (e) {
        items = [];
      }

      const cName = r.customer_name || addr.name || addr.customerName || "Boutique Customer";
      const cPhone = r.customer_phone || addr.phone || addr.customerPhone || "";
      const cEmail = r.customer_email || addr.email || addr.customerEmail || "";

      return {
        id: r.id,
        orderNumber: r.order_number,
        customerName: cName,
        customerPhone: cPhone,
        customerEmail: cEmail,
        shippingAddress: {
          name: addr.name || cName,
          phone: addr.phone || cPhone,
          email: addr.email || cEmail,
          line1: addr.line1 || addr.address || addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          pin: addr.pin || addr.pincode || addr.zip || "",
          tag: addr.tag || "Home",
        },
        subtotal: parseFloat(r.subtotal || 0),
        shippingFee: parseFloat(r.shipping_fee || 0),
        codFee: parseFloat(r.cod_fee || 0),
        totalAmount: parseFloat(r.total_amount || 0),
        paymentMethod: r.payment_method || "online",
        paymentStatus: r.payment_status || "pending",
        orderStatus: r.order_status || "confirmed",
        items: Array.isArray(items) ? items : [],
        createdAt: r.created_at || new Date().toISOString(),
      };
    });

    res.json({ success: true, count: formatted.length, orders: formatted });
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
}

// PUT /api/orders/:id/status (Admin Only)
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!pool || !isConnected) {
      const order = inMemoryOrders.find((o) => o.orderNumber === id || String(o.id) === String(id));
      if (order) {
        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
      }
      return res.json({ success: true, message: "Order status updated (in-memory)" });
    }

    await pool.query(
      `UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status)
       WHERE id = ? OR order_number = ?`,
      [orderStatus || null, paymentStatus || null, id, id]
    );

    res.json({ success: true, message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error in updateOrderStatus:", err);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
}

// DELETE /api/orders/:id (Admin Only)
export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    if (!pool || !isConnected) {
      const idx = inMemoryOrders.findIndex((o) => o.orderNumber === id || String(o.id) === String(id));
      if (idx !== -1) inMemoryOrders.splice(idx, 1);
      return res.json({ success: true, message: "Order deleted (in-memory)" });
    }

    await pool.query("DELETE FROM orders WHERE id = ? OR order_number = ?", [id, id]);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error in deleteOrder:", err);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
}

// GET /api/admin/stats (Admin Only)
export async function getAdminStats(req, res) {
  try {
    if (!pool || !isConnected) {
      const totalOrders = inMemoryOrders.length;
      const totalRevenue = inMemoryOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingOrders = inMemoryOrders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length;
      return res.json({
        success: true,
        stats: {
          totalOrders,
          totalRevenue,
          pendingOrders,
          totalProducts: seedProducts.length,
        },
      });
    }

    const [ordersCount] = await pool.query("SELECT COUNT(*) as cnt, COALESCE(SUM(total_amount), 0) as rev FROM orders");
    const [pendingCount] = await pool.query("SELECT COUNT(*) as cnt FROM orders WHERE order_status IN ('pending', 'confirmed')");
    const [prodCount] = await pool.query("SELECT COUNT(*) as cnt FROM products WHERE is_active = 1");

    res.json({
      success: true,
      stats: {
        totalOrders: ordersCount[0]?.cnt || 0,
        totalRevenue: parseFloat(ordersCount[0]?.rev || 0),
        pendingOrders: pendingCount[0]?.cnt || 0,
        totalProducts: prodCount[0]?.cnt || 0,
      },
    });
  } catch (err) {
    console.error("Error in getAdminStats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
}



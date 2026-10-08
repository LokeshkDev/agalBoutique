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
    const order = {
      orderNumber: r.order_number,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      shippingAddress: typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address) : r.shipping_address,
      subtotal: parseFloat(r.subtotal),
      shippingFee: parseFloat(r.shipping_fee),
      codFee: parseFloat(r.cod_fee),
      totalAmount: parseFloat(r.total_amount),
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      orderStatus: r.order_status,
      items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
      createdAt: r.created_at,
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
      return res.json({ success: true, orders: inMemoryOrders });
    }

    const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100");
    res.json({ success: true, count: rows.length, orders: rows });
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
}


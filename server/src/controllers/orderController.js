import { pool, isConnected } from "../config/db.js";
import { seedProducts } from "../seed/seedData.js";

// Memory storage for dev mode when DB is not connected
const inMemoryOrders = [];

let schemaEnsured = false;
export async function ensureOrderSchema() {
  if (schemaEnsured || !pool || !isConnected) return;
  try {
    await pool.query(`
      ALTER TABLE orders 
      MODIFY COLUMN order_status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
      MODIFY COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'pending'
    `);
  } catch (err) {}
  try {
    await pool.query(`
      ALTER TABLE orders ADD COLUMN return_history JSON DEFAULT NULL
    `);
  } catch (err) {}
  schemaEnsured = true;
}

// POST /api/orders
export async function createOrder(req, res) {
  try {
    await ensureOrderSchema();
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

    // Fetch dynamic delivery settings from cms_settings
    let standardFee = 79;
    let freeThreshold = 999;

    if (pool && isConnected) {
      try {
        const [dRows] = await pool.query("SELECT setting_value FROM cms_settings WHERE setting_key = 'delivery_settings' LIMIT 1");
        if (dRows.length > 0) {
          const dVal = typeof dRows[0].setting_value === "string" ? JSON.parse(dRows[0].setting_value) : dRows[0].setting_value;
          if (dVal) {
            standardFee = parseFloat(dVal.standardFee ?? 79);
            freeThreshold = parseFloat(dVal.freeThreshold ?? 999);
          }
        }
      } catch (dErr) {
        console.error("Warning reading delivery_settings in createOrder:", dErr.message);
      }
    }

    const shippingFee = calculatedSubtotal >= freeThreshold ? 0 : standardFee;
    const codFee = 0; // Free COD per requirements
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
      paymentStatus: "pending",
      orderStatus: "confirmed",
      items: processedItems,
      createdAt: new Date().toISOString(),
    };

    // Deduct stock for each ordered item
    for (const pItem of processedItems) {
      const qtyToDeduct = parseInt(pItem.qty || 1, 10);
      const prodId = pItem.id;
      const szLabel = pItem.size;
      const colName = pItem.color;

      if (pool && isConnected && prodId) {
        try {
          const pSql = "SELECT id, sizes FROM products WHERE id = ? OR slug = ? LIMIT 1";
          const pParams = [String(prodId), pItem.slug || String(prodId)];

          const [pRows] = await pool.query(pSql, pParams);
          if (pRows.length > 0) {
            const p = pRows[0];
            let rawSizes = p.sizes;
            if (typeof rawSizes === "string") {
              try { rawSizes = JSON.parse(rawSizes); } catch (e) { rawSizes = []; }
            }
            if (!Array.isArray(rawSizes)) rawSizes = [];

            // Standardize rawSizes into array of size objects
            let sizesArr = rawSizes.map((s) => {
              if (typeof s === "string") {
                return { label: s, stock: 10 };
              }
              if (s && typeof s === "object") {
                return {
                  label: s.label || s.size || "Free Size",
                  stock: s.stock !== undefined && s.stock !== null ? parseInt(s.stock, 10) : 10,
                  color: s.color || "",
                };
              }
              return { label: "Free Size", stock: 10 };
            });

            if (sizesArr.length === 0) {
              sizesArr = [{ label: szLabel || "Free Size", stock: 10 }];
            }

            const targetSzNorm = String(szLabel || "").trim().toLowerCase();
            const targetColNorm = String(colName || "").trim().toLowerCase();

            let matchedIdx = sizesArr.findIndex((s) => {
              const sLabelNorm = String(s.label || "").trim().toLowerCase();
              const sColNorm = String(s.color || "").trim().toLowerCase();
              return (sLabelNorm === targetSzNorm) && (!targetColNorm || !sColNorm || sColNorm === targetColNorm);
            });

            if (matchedIdx === -1) {
              matchedIdx = sizesArr.findIndex((s) => String(s.label || "").trim().toLowerCase() === targetSzNorm);
            }

            if (matchedIdx === -1 && sizesArr.length > 0) {
              matchedIdx = 0;
            }

            if (matchedIdx !== -1) {
              const currentStock = parseInt(sizesArr[matchedIdx].stock ?? 10, 10);
              sizesArr[matchedIdx].stock = Math.max(0, currentStock - qtyToDeduct);
              await pool.query("UPDATE products SET sizes = ? WHERE id = ?", [JSON.stringify(sizesArr), p.id]);
            }
          }
        } catch (stockErr) {
          console.error("Warning: Failed to deduct stock in createOrder:", stockErr.message);
        }
      }

      // Also update in-memory seedProducts if present
      const memProd = seedProducts.find((p) => String(p.id) === String(prodId) || p.slug === pItem.slug);
      if (memProd) {
        let memSizes = Array.isArray(memProd.sizes) ? memProd.sizes : [];
        const targetSzNorm = String(szLabel || "").trim().toLowerCase();
        let mIdx = memSizes.findIndex((s) => s && typeof s === "object" && String(s.label || "").trim().toLowerCase() === targetSzNorm);
        if (mIdx === -1 && memSizes.length > 0) mIdx = 0;
        if (mIdx !== -1 && memSizes[mIdx]) {
          const cStock = parseInt(memSizes[mIdx].stock ?? 10, 10);
          memSizes[mIdx].stock = Math.max(0, cStock - qtyToDeduct);
        }
      }
    }

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
        "pending",
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

    let retHist = [];
    try {
      retHist = typeof r.return_history === "string" ? JSON.parse(r.return_history) : (r.return_history || []);
    } catch (e) {
      retHist = [];
    }

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
      returnHistory: Array.isArray(retHist) ? retHist : [],
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

      let retHist = [];
      try {
        retHist = typeof r.return_history === "string" ? JSON.parse(r.return_history) : (r.return_history || []);
      } catch (e) {
        retHist = [];
      }

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
        returnHistory: Array.isArray(retHist) ? retHist : [],
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
    const isNum = typeof id === "number" || (/^\d+$/).test(String(id).trim());

    if (!pool || !isConnected) {
      const order = inMemoryOrders.find((o) => o.orderNumber === id || String(o.id) === String(id));
      if (order) {
        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
      }
      return res.json({ success: true, message: "Order status updated (in-memory)" });
    }

    const sql = isNum
      ? `UPDATE orders SET order_status = COALESCE(?, order_status), payment_status = COALESCE(?, payment_status) WHERE id = ? OR order_number = ?`
      : `UPDATE orders SET order_status = COALESCE(?, order_status), payment_status = COALESCE(?, payment_status) WHERE order_number = ?`;
    const params = isNum
      ? [orderStatus || null, paymentStatus || null, parseInt(id, 10), String(id)]
      : [orderStatus || null, paymentStatus || null, String(id)];

    await pool.query(sql, params);

    res.json({ success: true, message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error in updateOrderStatus:", err);
    res.status(500).json({ success: false, message: `Failed to update order status: ${err.message}` });
  }
}

// DELETE /api/orders/:id (Admin Only)
export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const isNum = typeof id === "number" || (/^\d+$/).test(String(id).trim());

    if (!pool || !isConnected) {
      const idx = inMemoryOrders.findIndex((o) => o.orderNumber === id || String(o.id) === String(id));
      if (idx !== -1) inMemoryOrders.splice(idx, 1);
      return res.json({ success: true, message: "Order deleted (in-memory)" });
    }

    const sql = isNum
      ? "DELETE FROM orders WHERE id = ? OR order_number = ?"
      : "DELETE FROM orders WHERE order_number = ?";
    const params = isNum ? [parseInt(id, 10), String(id)] : [String(id)];

    await pool.query(sql, params);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error in deleteOrder:", err);
    res.status(500).json({ success: false, message: `Failed to delete order: ${err.message}` });
  }
}

// POST /api/orders/:id/return (Admin Only)
export async function processOrderReturn(req, res) {
  try {
    await ensureOrderSchema();
    const { id } = req.params;
    const { itemsToReturn, reason } = req.body || {};
    const isNum = typeof id === "number" || (/^\d+$/).test(String(id).trim());
    let order = null;

    if (pool && isConnected) {
      const sql = isNum
        ? "SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1"
        : "SELECT * FROM orders WHERE order_number = ? LIMIT 1";
      const params = isNum ? [parseInt(id, 10), String(id)] : [String(id)];

      const [rows] = await pool.query(sql, params);
      if (rows.length > 0) order = rows[0];
    } else {
      order = inMemoryOrders.find((o) => o.orderNumber === id || String(o.id) === String(id));
    }

    if (!order) {
      return res.status(404).json({ success: false, message: `Order #${id} not found.` });
    }

    let items = [];
    try {
      items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);
    } catch (e) {
      items = order.items || [];
    }
    if (!Array.isArray(items)) items = [];

    const itemsToProcess = Array.isArray(itemsToReturn) && itemsToReturn.length > 0
      ? itemsToReturn
      : items;

    // Restore stock for returned items based on specified return quantity
    for (const item of itemsToProcess) {
      if (!item) continue;
      const qtyToRestore = parseInt(item.returnQty || item.qty || item.quantity || 1, 10);
      const prodId = item.id;
      const szLabel = item.size;
      const colName = item.color;

      if (pool && isConnected && prodId) {
        try {
          const pSql = "SELECT id, sizes FROM products WHERE id = ? OR slug = ? LIMIT 1";
          const pParams = [String(prodId), item.slug || String(prodId)];

          const [pRows] = await pool.query(pSql, pParams);
          if (pRows.length > 0) {
            const p = pRows[0];
            let rawSizes = p.sizes;
            if (typeof rawSizes === "string") {
              try { rawSizes = JSON.parse(rawSizes); } catch (e) { rawSizes = []; }
            }
            if (!Array.isArray(rawSizes)) rawSizes = [];

            let sizesArr = rawSizes.map((s) => {
              if (typeof s === "string") return { label: s, stock: 10 };
              if (s && typeof s === "object") {
                return {
                  label: s.label || s.size || "Free Size",
                  stock: s.stock !== undefined && s.stock !== null ? parseInt(s.stock, 10) : 10,
                  color: s.color || "",
                };
              }
              return { label: "Free Size", stock: 10 };
            });

            if (sizesArr.length === 0) {
              sizesArr = [{ label: szLabel || "Free Size", stock: 10 }];
            }

            const targetSzNorm = String(szLabel || "").trim().toLowerCase();
            const targetColNorm = String(colName || "").trim().toLowerCase();

            let matchedIdx = sizesArr.findIndex((s) => {
              const sLabelNorm = String(s.label || "").trim().toLowerCase();
              const sColNorm = String(s.color || "").trim().toLowerCase();
              return (sLabelNorm === targetSzNorm) && (!targetColNorm || !sColNorm || sColNorm === targetColNorm);
            });

            if (matchedIdx === -1) {
              matchedIdx = sizesArr.findIndex((s) => String(s.label || "").trim().toLowerCase() === targetSzNorm);
            }

            if (matchedIdx === -1 && sizesArr.length > 0) {
              matchedIdx = 0;
            }

            if (matchedIdx !== -1) {
              const currentStock = parseInt(sizesArr[matchedIdx].stock ?? 0, 10);
              sizesArr[matchedIdx].stock = currentStock + qtyToRestore;
              await pool.query("UPDATE products SET sizes = ? WHERE id = ?", [JSON.stringify(sizesArr), p.id]);
            }
          }
        } catch (itemErr) {
          console.error(`Warning: Failed to update stock for item ${prodId}:`, itemErr.message);
        }
      }

      // Also update in-memory seedProducts if present
      const memProd = seedProducts.find((p) => String(p.id) === String(prodId) || p.slug === item.slug);
      if (memProd) {
        let memSizes = Array.isArray(memProd.sizes) ? memProd.sizes : [];
        const targetSzNorm = String(szLabel || "").trim().toLowerCase();
        let mIdx = memSizes.findIndex((s) => s && typeof s === "object" && String(s.label || "").trim().toLowerCase() === targetSzNorm);
        if (mIdx === -1 && memSizes.length > 0) mIdx = 0;
        if (mIdx !== -1 && memSizes[mIdx]) {
          const cStock = parseInt(memSizes[mIdx].stock ?? 0, 10);
          memSizes[mIdx].stock = cStock + qtyToRestore;
        }
      }
    }

    // Build return history entry
    let returnHistory = [];
    try {
      returnHistory = typeof order.return_history === "string"
        ? JSON.parse(order.return_history)
        : (order.return_history || order.returnHistory || []);
    } catch (e) {
      returnHistory = [];
    }
    if (!Array.isArray(returnHistory)) returnHistory = [];

    const returnLog = {
      id: "RET-" + Date.now(),
      timestamp: new Date().toISOString(),
      reason: reason || "Customer Return",
      items: itemsToProcess.map((it) => ({
        id: it.id,
        name: it.name || it.title || "Product",
        size: it.size || "Free Size",
        color: it.color || "",
        returnQty: parseInt(it.returnQty || it.qty || it.quantity || 1, 10),
      })),
    };
    returnHistory.push(returnLog);

    // Update order status & return history
    if (pool && isConnected) {
      const uSql = isNum
        ? "UPDATE orders SET order_status = 'returned', payment_status = 'refunded', return_history = ? WHERE id = ? OR order_number = ?"
        : "UPDATE orders SET order_status = 'returned', payment_status = 'refunded', return_history = ? WHERE order_number = ?";
      const uParams = isNum
        ? [JSON.stringify(returnHistory), parseInt(id, 10), String(id)]
        : [JSON.stringify(returnHistory), String(id)];
      await pool.query(uSql, uParams);
    } else {
      order.orderStatus = "returned";
      order.paymentStatus = "refunded";
      order.return_history = returnHistory;
      order.returnHistory = returnHistory;
    }

    res.json({ success: true, message: `Order #${id} marked as returned and item stock restored to inventory.` });
  } catch (err) {
    console.error("Error in processOrderReturn:", err);
    res.status(500).json({ success: false, message: `Failed to process order return: ${err.message}` });
  }
}

// POST /api/orders/:id/replace (Admin Only)
export async function processOrderReplace(req, res) {
  try {
    await ensureOrderSchema();
    const { id } = req.params;
    const { returnItemId, replacementProductId, replacementSize, replacementColor, qty = 1 } = req.body;
    const isNum = typeof id === "number" || (/^\d+$/).test(String(id).trim());

    let order = null;
    if (pool && isConnected) {
      const sql = isNum
        ? "SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1"
        : "SELECT * FROM orders WHERE order_number = ? LIMIT 1";
      const params = isNum ? [parseInt(id, 10), String(id)] : [String(id)];
      const [rows] = await pool.query(sql, params);
      if (rows.length > 0) order = rows[0];
    } else {
      order = inMemoryOrders.find((o) => o.orderNumber === id || String(o.id) === String(id));
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let items = [];
    try {
      items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);
    } catch (e) {
      items = order.items || [];
    }
    if (!Array.isArray(items)) items = [];

    const replaceQty = parseInt(qty, 10) || 1;

    // 1. Restore stock of returned item
    const originalItem = items.find((i) => i && String(i.id) === String(returnItemId)) || items[0];
    if (originalItem && pool && isConnected) {
      try {
        const prodId = originalItem.id;
        const isProdNum = typeof prodId === "number" || (/^\d+$/).test(String(prodId).trim());
        const pSql = isProdNum
          ? "SELECT id, sizes FROM products WHERE id = ? OR slug = ? LIMIT 1"
          : "SELECT id, sizes FROM products WHERE slug = ? OR id = ? LIMIT 1";
        const pParams = isProdNum ? [parseInt(prodId, 10), originalItem.slug || String(prodId)] : [originalItem.slug || String(prodId), String(prodId)];

        const [pRows] = await pool.query(pSql, pParams);
        if (pRows.length > 0) {
          const p = pRows[0];
          let sizesArr = [];
          if (p.sizes) {
            sizesArr = typeof p.sizes === "string" ? JSON.parse(p.sizes) : (p.sizes || []);
          }
          if (!Array.isArray(sizesArr)) sizesArr = [];

          sizesArr = sizesArr.map((s) => {
            if (s && typeof s === "object" && String(s.label) === String(originalItem.size)) {
              return { ...s, stock: (parseInt(s.stock || 0, 10) + replaceQty) };
            }
            return s;
          });
          await pool.query("UPDATE products SET sizes = ? WHERE id = ?", [JSON.stringify(sizesArr), p.id]);
        }
      } catch (origErr) {
        console.error("Warning: Failed restoring stock for replacement original item:", origErr.message);
      }
    }

    // 2. Validate & decrement stock of replacement item
    const targetProdId = replacementProductId || originalItem?.id;
    let replacementProd = null;

    if (pool && isConnected && targetProdId) {
      try {
        const isTargetNum = typeof targetProdId === "number" || (/^\d+$/).test(String(targetProdId).trim());
        const rSql = isTargetNum
          ? "SELECT id, name, sizes, price FROM products WHERE id = ? OR slug = ? LIMIT 1"
          : "SELECT id, name, sizes, price FROM products WHERE slug = ? OR id = ? LIMIT 1";
        const rParams = isTargetNum ? [parseInt(targetProdId, 10), String(targetProdId)] : [String(targetProdId), String(targetProdId)];
        const [rRows] = await pool.query(rSql, rParams);
        if (rRows.length > 0) replacementProd = rRows[0];
      } catch (rErr) {
        console.error("Warning querying replacement product:", rErr.message);
      }
    }

    if (!replacementProd) {
      replacementProd = seedProducts.find((p) => String(p.id) === String(targetProdId) || p.slug === targetProdId) || seedProducts[0];
    }

    if (replacementProd) {
      let rSizes = [];
      if (replacementProd.sizes) {
        rSizes = typeof replacementProd.sizes === "string" ? JSON.parse(replacementProd.sizes) : (replacementProd.sizes || []);
      }
      if (!Array.isArray(rSizes)) rSizes = [];

      const targetSize = replacementSize || originalItem?.size || "Free Size";
      const targetColor = replacementColor || originalItem?.color || "";

      let foundVariant = rSizes.find((s) => {
        if (!s || typeof s !== "object") return false;
        const matchSz = String(s.label) === String(targetSize);
        const matchCol = !targetColor || !s.color || String(s.color).toLowerCase() === String(targetColor).toLowerCase();
        return matchSz && matchCol;
      }) || rSizes.find((s) => s && typeof s === "object" && String(s.label) === String(targetSize));

      const availableStock = foundVariant ? parseInt(foundVariant.stock || 0, 10) : 10;
      if (availableStock < replaceQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for replacement variant (${targetSize} ${targetColor}). Available: ${availableStock}`,
        });
      }

      // Decrement replacement stock
      rSizes = rSizes.map((s) => {
        if (s && typeof s === "object") {
          const matchSz = String(s.label) === String(targetSize);
          const matchCol = !targetColor || !s.color || String(s.color).toLowerCase() === String(targetColor).toLowerCase();
          if (matchSz && matchCol) {
            return { ...s, stock: Math.max(0, parseInt(s.stock || 0, 10) - replaceQty) };
          }
        }
        return s;
      });

      if (pool && isConnected && replacementProd.id) {
        await pool.query("UPDATE products SET sizes = ? WHERE id = ?", [JSON.stringify(rSizes), replacementProd.id]);
      }
    }

    // Build replacement history entry
    const { reason } = req.body || {};
    let returnHistory = [];
    try {
      returnHistory = typeof order.return_history === "string"
        ? JSON.parse(order.return_history)
        : (order.return_history || order.returnHistory || []);
    } catch (e) {
      returnHistory = [];
    }
    if (!Array.isArray(returnHistory)) returnHistory = [];

    const replaceLog = {
      id: "REP-" + Date.now(),
      type: "replacement",
      timestamp: new Date().toISOString(),
      reason: reason || "Size / Fitting / Color Exchange Replacement",
      returnedItem: {
        id: originalItem?.id,
        name: originalItem?.name || "Product",
        size: originalItem?.size || "Free Size",
        color: originalItem?.color || "",
      },
      replacementItem: {
        id: replacementProd?.id || targetProdId,
        name: replacementProd?.name || originalItem?.name || "Product",
        size: targetSize,
        color: targetColor,
        qty: replaceQty,
      },
      qty: replaceQty,
      replacementSize: targetSize,
      replacementColor: targetColor,
    };
    returnHistory.push(replaceLog);

    // Update order status & return history
    if (pool && isConnected) {
      const uSql = isNum
        ? "UPDATE orders SET order_status = 'replaced', return_history = ? WHERE id = ? OR order_number = ?"
        : "UPDATE orders SET order_status = 'replaced', return_history = ? WHERE order_number = ?";
      const uParams = isNum
        ? [JSON.stringify(returnHistory), parseInt(id, 10), String(id)]
        : [JSON.stringify(returnHistory), String(id)];
      await pool.query(uSql, uParams);
    } else {
      order.orderStatus = "replaced";
      order.return_history = returnHistory;
      order.returnHistory = returnHistory;
    }

    res.json({
      success: true,
      message: `Order #${id} processed for replacement with variant (${replacementSize || originalItem?.size} ${replacementColor || originalItem?.color}). Stock updated.`,
    });
  } catch (err) {
    console.error("Error in processOrderReplace:", err);
    res.status(500).json({ success: false, message: `Failed to process order replacement: ${err.message}` });
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




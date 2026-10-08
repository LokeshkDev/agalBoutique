import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { pool, isConnected } from "../config/db.js";
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key_id";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_razorpay_secret_key";

let instance = null;
try {
  instance = new Razorpay({ key_id, key_secret });
} catch (e) {
  console.warn("⚠️ Razorpay SDK initialization note:", e.message);
}

// POST /api/payments/razorpay/order
export async function createRazorpayOrder(req, res) {
  try {
    const { amount, orderNumber } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid order amount required" });
    }

    const amountInPaise = Math.round(parseFloat(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: orderNumber || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    if (!instance || key_id.includes("dummy")) {
      // Mock Razorpay Order Response in Dev / Test mode
      const mockRazorpayId = `order_mock_${Date.now()}`;

      if (pool && isConnected && orderNumber) {
        await pool.query(
          "UPDATE orders SET razorpay_order_id = ? WHERE order_number = ?",
          [mockRazorpayId, orderNumber]
        );
      }

      return res.json({
        success: true,
        key: key_id,
        order_id: mockRazorpayId,
        amount: amountInPaise,
        currency: "INR",
        isMock: true,
      });
    }

    const razorpayOrder = await instance.orders.create(options);

    if (pool && isConnected && orderNumber) {
      await pool.query(
        "UPDATE orders SET razorpay_order_id = ? WHERE order_number = ?",
        [razorpayOrder.id, orderNumber]
      );
    }

    res.json({
      success: true,
      key: key_id,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      isMock: false,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create payment order" });
  }
}

// POST /api/payments/razorpay/verify
export async function verifyRazorpayPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: "Missing Razorpay payment tokens" });
    }

    if (razorpay_order_id.startsWith("order_mock_")) {
      // Mock payment verification success
      if (pool && isConnected && orderNumber) {
        await pool.query(
          "UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ? WHERE order_number = ?",
          [razorpay_payment_id, orderNumber]
        );
      }
      return res.json({
        success: true,
        message: "Mock Payment Verified Successfully",
        orderNumber,
      });
    }

    // Official HMAC-SHA256 Signature Verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      if (pool && isConnected && orderNumber) {
        await pool.query(
          "UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ? WHERE order_number = ?",
          [razorpay_payment_id, orderNumber]
        );
      }

      res.json({
        success: true,
        message: "Payment Verified Successfully",
        orderNumber,
      });
    } else {
      if (pool && isConnected && orderNumber) {
        await pool.query(
          "UPDATE orders SET payment_status = 'failed' WHERE order_number = ?",
          [orderNumber]
        );
      }
      res.status(400).json({ success: false, message: "Invalid payment signature verification failed" });
    }
  } catch (err) {
    console.error("Error in verifyRazorpayPayment:", err);
    res.status(500).json({ success: false, message: "Payment verification error" });
  }
}


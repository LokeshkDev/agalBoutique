import { Router } from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/paymentController.js";

const router = Router();

router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;


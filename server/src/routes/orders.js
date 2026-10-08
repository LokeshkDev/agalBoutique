import { Router } from "express";
import { createOrder, getOrder, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.post("/", createOrder);
router.get("/all", adminAuthMiddleware, getAllOrders);
router.put("/:id/status", adminAuthMiddleware, updateOrderStatus);
router.get("/:orderNumber", getOrder);

export default router;

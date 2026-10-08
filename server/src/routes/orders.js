import { Router } from "express";
import { createOrder, getOrder, getAllOrders } from "../controllers/orderController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.post("/", createOrder);
router.get("/all", adminAuthMiddleware, getAllOrders);
router.get("/:orderNumber", getOrder);

export default router;


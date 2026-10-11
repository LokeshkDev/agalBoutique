import { Router } from "express";
import {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  processOrderReturn,
  processOrderReplace,
  sendOrderInvoice,
} from "../controllers/orderController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.post("/", createOrder);
router.get("/all", adminAuthMiddleware, getAllOrders);
router.put("/:id/status", adminAuthMiddleware, updateOrderStatus);
router.post("/:id/return", adminAuthMiddleware, processOrderReturn);
router.post("/:id/replace", adminAuthMiddleware, processOrderReplace);
router.post("/:orderNumber/send-invoice", sendOrderInvoice);
router.delete("/:id", adminAuthMiddleware, deleteOrder);
router.get("/:orderNumber", getOrder);

export default router;


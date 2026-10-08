import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from "../controllers/productController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.post("/", adminAuthMiddleware, createProduct);
router.post("/bulk-delete", adminAuthMiddleware, bulkDeleteProducts);
router.put("/:id", adminAuthMiddleware, updateProduct);
router.delete("/:id", adminAuthMiddleware, deleteProduct);

export default router;

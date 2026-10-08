import { Router } from "express";
import { getProducts, getProductBySlug, createProduct } from "../controllers/productController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.post("/", adminAuthMiddleware, createProduct);

export default router;


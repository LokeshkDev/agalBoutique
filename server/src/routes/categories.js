import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", getCategories);
router.post("/", adminAuthMiddleware, createCategory);
router.put("/:id", adminAuthMiddleware, updateCategory);
router.delete("/:id", adminAuthMiddleware, deleteCategory);

export default router;

import { Router } from "express";
import { uploadMiddleware, uploadImage } from "../controllers/uploadController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

// POST /api/admin/upload
router.post("/", adminAuthMiddleware, uploadMiddleware, uploadImage);

export default router;


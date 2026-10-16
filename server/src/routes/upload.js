import { Router } from "express";
import { uploadMiddleware, uploadImage, checkUploadStatus } from "../controllers/uploadController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

// GET /api/admin/upload/status (Health & Connectivity check for R2)
router.get("/status", checkUploadStatus);

// POST /api/admin/upload
router.post("/", adminAuthMiddleware, uploadMiddleware, uploadImage);

export default router;



import { Router } from "express";
import { adminLogin, getAdminMe, adminLogout } from "../controllers/adminAuthController.js";
import { getAdminStats } from "../controllers/orderController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/me", adminAuthMiddleware, getAdminMe);
router.post("/logout", adminAuthMiddleware, adminLogout);
router.get("/stats", adminAuthMiddleware, getAdminStats);

export default router;

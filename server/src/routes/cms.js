import { Router } from "express";
import { getCmsSettings, updateCmsSettings } from "../controllers/cmsController.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", getCmsSettings);
router.put("/admin", adminAuthMiddleware, updateCmsSettings);

export default router;


// routes/notificationRoutes.js
import { Router } from "express";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../controllers/notificationPreference.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/fetch", verifyJWT, getNotificationSettings);
router.post("/update", verifyJWT, updateNotificationSettings);

export default router;

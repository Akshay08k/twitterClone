import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getPrivacySettings,
  updatePrivacySettings,
} from "../controllers/privacy.controller.js";

const router = Router();

router.get("/fetch", verifyJWT, getPrivacySettings);
router.post("/update", verifyJWT, updatePrivacySettings);

export default router;

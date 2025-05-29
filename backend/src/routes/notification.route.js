import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/fetch").get(verifyJWT, getNotifications);

export default router;

import { Router } from "express";
import {
  getSubscriptionPlans,
  getSubscriptionStatus,
  subscribeToPremium,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/plans").get(getSubscriptionPlans);
router.route("/status").get(verifyJWT, getSubscriptionStatus);
router.route("/subscribe").post(verifyJWT, subscribeToPremium);
router.route("/cancel").post(verifyJWT, cancelSubscription);

export default router;

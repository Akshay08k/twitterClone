import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  sendFollowRequest,
  getFollowRequestStatus,
  withdrawFollowRequest,
  acceptFollowRequest,
  deleteFollowRequest,
  getPendingFollowRequests,
} from "../controllers/followrequest.controller.js";

const router = Router();

router.route("/send/:id").post(verifyJWT, sendFollowRequest);
router.route("/status/:id").get(verifyJWT, getFollowRequestStatus);
router.route("/withdraw/:id").delete(verifyJWT, withdrawFollowRequest);
router.route("/accept/:fromUserId").post(verifyJWT, acceptFollowRequest);
router.route("/delete/:fromUserId").delete(verifyJWT, deleteFollowRequest);
router.get("/pending", verifyJWT, getPendingFollowRequests);

export default router;

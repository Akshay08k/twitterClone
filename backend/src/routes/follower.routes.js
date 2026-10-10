import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createFollower,
  getFollowers,
  deleteFollower,
  getFollowing,
  isFollowing,
} from "../controllers/follower.controller.js";

const router = Router();

router.route("/create/:userId").post(verifyJWT, createFollower);
router.route("/followers").get(verifyJWT, getFollowers);
router.route("/remove/:followerId").delete(verifyJWT, deleteFollower);
router.route("/following").get(verifyJWT, getFollowing).post(verifyJWT, getFollowing);
router.route("/isFollowing/:userId").get(verifyJWT, isFollowing).post(verifyJWT, isFollowing);
router.route("/isfollwing/:userId").get(verifyJWT, isFollowing).post(verifyJWT, isFollowing);

export default router;

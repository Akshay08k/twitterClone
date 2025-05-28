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

router.post("/create/:userId", verifyJWT, createFollower);

router.get("/followers", verifyJWT, getFollowers);

router.delete("/remove/:followerId", verifyJWT, deleteFollower);

router.post("/following", verifyJWT, getFollowing);

router.post("/isfollwing/:userId", verifyJWT, isFollowing);

export default router;

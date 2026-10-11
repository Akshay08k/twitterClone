import { Router } from "express";
import {
  registerSimUser,
  postSimTweet,
  getSimTweets,
  getSimUsers,
  sendSimMessage,
  getActiveHandles,
  getRecentPostsForInteraction,
  postSimLike,
} from "../controllers/sim.controller.js";

const router = Router();

router.post("/register", registerSimUser);
router.post("/post", postSimTweet);
router.post("/like", postSimLike);
router.post("/message", sendSimMessage);
router.get("/tweets", getSimTweets);
router.get("/users", getSimUsers);
router.get("/handles", getActiveHandles);
router.get("/posts", getRecentPostsForInteraction);

export default router;

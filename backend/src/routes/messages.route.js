import { Router } from "express";
import {
  getConversations,
  getMessagesBetweenUsers,
  sendMessage,
  getChatUsers,
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/conversations/:userId", verifyJWT, getConversations);
router.get("/fetch/:userId/", verifyJWT, getMessagesBetweenUsers);
router.post("/send", verifyJWT, sendMessage);
router.get("/users", verifyJWT, getChatUsers);

export default router;

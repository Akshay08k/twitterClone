import { Router } from "express";
import { createComment, getComments, deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();


router.route("/:postId").get(verifyJWT, getComments);
router.route("/:postId/create").post(verifyJWT, createComment)
router.route("/:postId/:commentId").delete(verifyJWT, deleteComment);

export default router
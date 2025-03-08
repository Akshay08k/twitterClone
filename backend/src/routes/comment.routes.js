import { Router } from "express";
import { createComment, getComments } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();


// `http://localhost:3000/comment/${post._id}/create`,
router.route("/:postId").get(verifyJWT, getComments);
router.route("/:postId/create").post(verifyJWT, createComment)

export default router
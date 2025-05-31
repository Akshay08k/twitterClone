import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createPost,
  getPosts,
  PostLikeHandler,
  getSinglePost,
  fetchingPostsByUserId,
  deletePost,
} from "../controllers/post.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/create").post(
  upload.fields([
    {
      name: "postImages",
      maxCount: 5,
    },
  ]),
  verifyJWT,
  createPost
);

router.route("/").get(verifyJWT, getPosts);
router.route("/:postId/like").post(verifyJWT, PostLikeHandler);
router.route("/post/:postId").get(verifyJWT, getSinglePost);
router.route("/user/:userId").get(verifyJWT, fetchingPostsByUserId);
router.route("/:postId").delete(verifyJWT, deletePost);

export default router;

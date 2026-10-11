import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createPost,
  getPosts,
  PostLikeHandler,
  getSinglePost,
  fetchingPostsByUserId,
  deletePost,
  updatePost,
  toggleBookmark,
  getBookmarks,
  getTrendingHashtags,
  recordUserInteraction,
  dismissPost,
  getUserAffinityProfile,
  tuneTopicAffinity,
  resetAlgorithmProfile,
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
router.route("/trends").get(verifyJWT, getTrendingHashtags);
router.route("/bookmarks").get(verifyJWT, getBookmarks);
router.route("/interaction").post(verifyJWT, recordUserInteraction);
router.route("/dismiss/:postId").post(verifyJWT, dismissPost);
router.route("/recommendations/affinity").get(verifyJWT, getUserAffinityProfile);
router.route("/recommendations/tune-topic").post(verifyJWT, tuneTopicAffinity);
router.route("/recommendations/reset").post(verifyJWT, resetAlgorithmProfile);
router.route("/:postId/bookmark").post(verifyJWT, toggleBookmark);
router.route("/:postId/like").post(verifyJWT, PostLikeHandler);
router.route("/post/:postId").get(verifyJWT, getSinglePost);
router.route("/user/:userId").get(verifyJWT, fetchingPostsByUserId);
router.route("/:postId").put(verifyJWT, updatePost).delete(verifyJWT, deletePost);

export default router;

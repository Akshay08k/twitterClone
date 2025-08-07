import { Router } from "express";
import {
  registerUser,
  login,
  updatePassword,
  updateUserAvatar,
  me,
  logout,
  refreshAccessToken,
  updateUserDetails,
  updateBannerImage,
  getUserByUsername,
  deleteAccount,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, validateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(login);

router.route("/refresh-token").post(refreshAccessToken);
router.route("/validateToken").post(validateToken);
router
  .route("/avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/bannerImage")
  .post(verifyJWT, upload.single("bannerImage"), updateBannerImage);
router.route("/change-password").post(verifyJWT, updatePassword);
router.route("/me").get(verifyJWT, me);
router.route("/update-details").post(verifyJWT, updateUserDetails);
router.route("/profile/:username").get(verifyJWT, getUserByUsername);
router.route("/logout").post(verifyJWT, logout);
router.route("/delete-account").delete(verifyJWT, deleteAccount);

export default router;

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

//secured routes
router.route("/refresh-token").post(refreshAccessToken);
router.route("/validateToken").post(validateToken);
router
  .route("/avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/change-password").post(verifyJWT, updatePassword);
router.route("/me").get(verifyJWT, me);
router.route("/update-details").post(verifyJWT, updateUserDetails);
router.route("/logout").post(verifyJWT, logout);

export default router;

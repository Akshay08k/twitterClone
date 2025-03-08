import { Router } from "express";
import {
    registerUser,
    loginUser,
    updatePassword,
    updateUserAvatar,
    getCurrentUser,
    LogoutUser,
    refreshAccessToken,
    updateUserDetails
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser);


//secured routes
router.route("/refresh-token").post(refreshAccessToken)
router.route("/avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/change-password").post(verifyJWT, updatePassword);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/update-details").post(verifyJWT, updateUserDetails);
router.route("/logout").post(verifyJWT, LogoutUser);

export default router

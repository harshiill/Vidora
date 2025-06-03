import { Router } from "express";
import { changeCurrentUserPassword, getCurrentUser, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateUserAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";




const router = Router();


router.route("/register").post(upload.fields([
    { name: 'avatar', maxCount: 1 
},{name: 'coverImage', maxCount: 1

}]),registerUser)


router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(VerifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(VerifyJWT,changeCurrentUserPassword);
router.route("/current-user").get(VerifyJWT,getCurrentUser);
router.route("/update-account").patch(VerifyJWT,updateAccountDetails);
router.route("/avatar").patch(VerifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(VerifyJWT,upload.single("coverImage"),updateCoverImage)

router.route("/c/:username").get(VerifyJWT,getCurrentUser);

router.route("/history").get(VerifyJWT,getWatchHistory);





export default router;
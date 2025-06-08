import { Router } from "express";
import { VerifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { getChannelStats,getChannelVideos } from '../controllers/dashboard.controller.js';
import app from '../app.js';
const router = Router();

router.use(VerifyJWT, upload.none());

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
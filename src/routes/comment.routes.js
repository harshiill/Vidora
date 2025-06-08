import { Router } from 'express';
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controller.js';
import { VerifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import app from '../app.js';
const router = Router();

router.use(VerifyJWT,upload.none());

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
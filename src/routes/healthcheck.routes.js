import {Router} from 'express';
import {healthcheck} from '../controllers/healthcheck.controller.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const router = Router();

router.route('/').get(healthcheck);

export default router;
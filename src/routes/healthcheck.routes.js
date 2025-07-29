import {Router} from 'express';
import asyncHandler from './../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { healthCheck } from '../controllers/healthcheck.controller.js';
import ApiError from '../utils/APIErros.js';


const router = Router();

router.route('/').get(healthcheck);

export default router;
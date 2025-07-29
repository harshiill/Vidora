
import ApiError from "../utils/APIErros.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from './../utils/asyncHandler.js';


const healthCheck = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(200, "Server is running smoothly", {
            status: "OK",
            timestamp: new Date().toISOString()
        })
    );
})

export { healthCheck };
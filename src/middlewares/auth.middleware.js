import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import ApiError from "../utils/APIErros";
import { User } from "../models/user.models";


export const VerifyJWT =asyncHandler(async (req,res,next) => {
   try {
     const token=req.cookies?.accessToken || req.header("authorization")?.split(' ')[1] 
 
     if(!token) {
        throw new ApiError(401,"Access token is required");
     }
 
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
     const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user) {
         throw new ApiError(401,"Invalid access token");
     }
 
     req.user=user;
     next();
   } catch (error) {
     throw new ApiError(401, error.message || "Unauthorized access");
    
   }
})
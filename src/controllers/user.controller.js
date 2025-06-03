import asyncHandler from './../utils/asyncHandler.js';
import ApiError from '../utils/APIErros.js';
import { User } from '../models/user.models.js';
import { DeleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
 import {v2 as cloudinary} from 'cloudinary';



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user=await User.findById(userId)

       const accessToken= user.generateAccessToken();
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, 'Error generating tokens');
    }

}

const registerUser = asyncHandler(async (req, res) => {
   //get user details from frontend
   // validation-not empty
   // check if user already exists: username or email
   //check if avatar and cover image 
   //upload for images,check for avatar and cover image
   // create user object-create entry in database
   // remove password and refresh token from response
   // check for user creation success
   // return success response with user details

   const { username, email, fullname, password } = req.body;
   console.log("User registration details:", { username, email, fullname, password });

  if(
    [username, email, fullname, password
    ].some(field => !field) // Check if any field is empty
  )
  {
    throw new ApiError(400, 'All fields are required');
  }

if(await User.findOne( {$or: [{username: req.body.username}, {email: req.body.email}]})) {
    throw new ApiError(409, 'Username or email already exists');
}

const avatarLocalPath=req.files?.avatar[0]?.path;
// const coverImageLocalPath=req.files?.coverImage[0]?.path;

if(!avatarLocalPath)
{
    throw new ApiError(400, 'Avatar image is required');
}
let coverImageLocalPath=null;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
     coverImageLocalPath=req.files?.coverImage[0]?.path;

}


const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

if(!avatar) {
    throw new ApiError(500, 'Failed to upload avatar image');
}

const user=await User.create({
    fullname,
    avatar:avatar.url,
    coverImage: coverImage ? coverImage.url : null,
    username:username.toLowerCase(),
    email,
    password,

})

const createdUser=await User.findById(user._id).select('-password -refreshToken');

if(!createdUser) {
    throw new ApiError(500, 'Something went wrong, user not created');
}

return  res.status(201).json(
    new ApiResponse(201, 'User registered successfully', createdUser)
)
});

const loginUser = asyncHandler(async (req,res) => {
 //get username or email and password through form
 //validate not empty
 //check email or username exists
 // check password is correct by comparing with hashed password
 // generate access token and refresh token
 //send cookie
 //return success response with user details and access token

 const {username,email,password} = req.body

 if(!username && !email) {
    throw new ApiError(400, 'Username or email is required');
 } 
 const user=await User.findOne({$or:[{username},{email}]})

 if(!user)
 {
    throw new ApiError(404, 'User not found');
 }


 const isPasswordCorrect=await user.isPasswordCorrect(password)

 if(!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid password');
 }
const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

const loggedInUser=await User.findById(user._id).select('-password -refreshToken');

const options={
    httpOnly:true,
    secure:true,

}

return res.status(200)
.cookie('refreshToken', refreshToken, options)
.cookie('accessToken', accessToken, options)
.json(
    new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
)


})

const logoutUser= asyncHandler(async (req,res) => {
   
   await User.findByIdAndUpdate(req.user._id,{$unset:{refreshToken:1}},{new:true,runValidators:true})

   const options={
    httpOnly:true,
    secure:true,

}

return res.status(200)
.clearCookie('refreshToken', options)
.clearCookie('accessToken', options)
.json(
    new ApiResponse(200, {}, "User Logged out Successfully")
)

}


)

const refreshAccessToken=asyncHandler(async(req,res) => {
   const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken || req.header("authorization")?.split(' ')[1];

   if(!incomingRefreshToken) {
    throw new ApiError(401, 'Unathotized Request');
   }

   try {
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user=await User.findById(decodedToken._id);
 
    if(!user)
    {
     throw new ApiError(401, 'Invalid refresh token');  
    }
    if(user?.refreshToken !== incomingRefreshToken) {
     throw new ApiError(401, 'Refresh Token is expired or invalid');
    }
 
    const options={
     httpOnly:true,
     secure:true,
    }
     const {accessToken, newrefreshToken}=await generateAccessAndRefreshToken(user._id);
 
     return res.status(200).cookie('accessToken', accessToken, options)
     .cookie('refreshToken', newrefreshToken, options)
     .json(new ApiResponse(200, {accessToken, newrefreshToken}, "Access Token refreshed successfully"))
   } catch (error) {
    throw new ApiError(401, error.message || 'Invalid refresh token');
   }
})

const changeCurrentUserPassword=asyncHandler(async(req,res)=> {
    const {oldPassword,newPassword,confPassword}= req.body;

    if(!oldPassword || !newPassword || !confPassword) {
        throw new ApiError(400, 'All fields are required');
    }
    if(newPassword !== confPassword) {
        throw new ApiError(400, 'New password and confirm password do not match');
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(401, 'Old password is incorrect');
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));

})

const getCurrentUser= asyncHandler(async(req,res) => {
    return res.status(200).json(new ApiResponse(200,res.user, "Current user details fetched successfully"));
})

const updateAccountDetails=asyncHandler(async(req,res)=> {
    const {fullname,email} = req.body;

    if(!fullname || !email) {
        throw new ApiError(400, 'All Fielda are required');
    }
    const user=await User.findByIdAndUpdate(req.user?._id, {
        $set:{
            fullname,
            email: email.toLowerCase(),
        }
    
},{new:true}

).select('-password -refreshToken');

return res.status(200).json(new ApiResponse(200, user, "User details updated successfully"));
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    
    const oldAvatar=req.user?.avatar;    
    if(oldAvatar)
    {
        // Delete the old avatar from Cloudinary
        const publicId = oldAvatar.split('/')[oldAvatar.split('/').length - 1].split('.')[0];
        const result=await cloudinary.uploader.destroy(oldAvatar.split('/').pop().split('.')[0]);

        
    }

    const AvatarLocalPath=req.file?.path

    if(!AvatarLocalPath) {
        throw new ApiError(400, 'Avatar image is required');
    }

    const avatar=await uploadOnCloudinary(AvatarLocalPath)

    if(!avatar.url)
    {
        throw new ApiError(500, 'Failed to upload avatar image');
    }

    const user=await User.findByIdAndUpdate(req.user?._id,{$set:{avatar:avatar.url}},{new:true,runValidators:true}).select('-password -refreshToken')

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));


})

const updateCoverImage=asyncHandler(async(req,res)=>{
    const oldCover=req.user?.coverImage;    
    if(oldCover)
    {
        // Delete the old avatar from Cloudinary
        const publicId = oldCover.split('/')[oldCover.split('/').length - 1].split('.')[0];
        const result=await cloudinary.uploader.destroy(oldCover.split('/').pop().split('.')[0]);

        
    }
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, 'Cover image is required');
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url)
    {
        throw new ApiError(500, 'Failed to upload cover image');
    }

    const user=await User.findByIdAndUpdate(req.user?._id,{$set:{coverImage:coverImage.url}},{new:true,runValidators:true}).select('-password -refreshToken')

    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
})

const getUserChannelProfile= asyncHandler(async(req,res)=>{
const {username} = req.params;

if(!username?.trim())
{
    throw new ApiError(400, 'Username is required');
}

    const channel=await User.aggregate([
        {
            $match: {username: username?.toLowerCase()}
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"

            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },{
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            
            }
        },
            {
                $project:{
                    fullname:1,
                    username:1,
                    avatar:1,
                    coverImage:1,
                    subscriberCount:1,
                    channelsSubscribedToCount:1,
                    isSubscribed:1
                }
            }
            

        
    ])

    if(channel?.length === 0) {
        throw new ApiError(404, 'Channel not found');
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));
})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: '$owner' }, // 💡 Also fixed this: key should be 'owner', not '$owner'
            },
          },
        ],
      },
    },
  ]);

  if (!user.length) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, 'Watch history fetched successfully'));
});

export { 
    registerUser ,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
};
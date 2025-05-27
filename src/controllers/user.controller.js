import asyncHandler from './../utils/asyncHandler.js';
import ApiError from '../utils/APIErros.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';



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

if(User.findOne( {$or: [{username: req.body.username}, {email: req.body.email}]})) {
    throw new ApiError(409, 'Username or email already exists');
}

const avatarLocalPath=req.files?.avatar[0]?.path;
const coverImageLocalPath=req.files?.coverImage[0]?.path;

if(!avatarLocalPath)
{
    throw new ApiError(400, 'Avatar image is required');
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





export { registerUser };
import asyncHandler from './../utils/asyncHandler.js';
import ApiError from '../utils/APIErros.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user=await User.findById(userId)

       const AccessToken= user.generateAccessToken()
        const RefreshToken=user.generateRefreshToken()

        user.refreshToken=RefreshToken;
        await user.save({validateBeforeSave: false});
        return { AccessToken, RefreshToken};

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
 if(!user)
 {
    throw new ApiError(404, 'User not found');
 }

 const user=await User.findOne({$or:[{username},{email}]})

 const isPasswordCorrect=await user.isPasswordCorrect(password)

 if(!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid password');
 }
const {AccessToken,RefreshToken}=await generateAccessAndRefreshToken(user._id)

const loggedInUser=await User.findById(user._id).select('-password -refreshToken');

const options={
    httpOnly:true,
    secure:true,

}

return res.status(200)
.cookie('refreshToken', RefreshToken, options)
.cookie('accessToken', AccessToken, options)
.json(
    new ApiResponse(200, 'User logged in successfully', {
        user: loggedInUser,accessToken: AccessToken, refreshToken: RefreshToken
        
    },"User Logged in Successfully")
)


})

const logoutUser= asyncHandler(async (req,res) => {
   
   await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken:undefined}},{new:true,runValidators:true})

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



export { 
    registerUser ,
    loginUser,
    logoutUser
};
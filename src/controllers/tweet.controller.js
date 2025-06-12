import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    const userId = req.user._id;
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }
    const tweet = await Tweet.create({
        content,
        owner: userId
    });
    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet");
    }
    return res.status(201).json(new ApiResponse(201,tweet,"Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline:[
                    {
                       $project:{
                        username: 1,
                        "avatar.url": 1,
                    } 
                    }
                    
                ]
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesDetails",
                pipeline:[
                    {
                        $project:{
                            likedBy: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{ $size: "$likesDetails" },
                ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] },
                isLiked:{
                    $in: [
                                new mongoose.Types.ObjectId(req.user._id),
                                {
                                  $map: {
                                    input: "$likesDetails",
                                    as: "like",
                                    in: "$$like.likedBy",
                                  },
                                },
                              ],
                }
            }
        },
        {
            $sort:{
                createdAt: -1 // Sort by creation date, most recent first
            }
        },
        {
            $project:{
                content: 1,
                ownerDetails: {
                    username: 1,
                    avatar: 1
                },
                likesCount: 1,
                isLiked: 1,
                createdAt: 1,
            }
        }
    ])

    if (!tweets) {
        throw new ApiError(404, "No tweets found for this user");
    }
    res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if(tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    tweet.content = content;
    const updatedTweet = await tweet.save({validateBeforeSave: false});
    if (!updatedTweet) {
        throw new ApiError(500, "Failed to update tweet");
    }
    res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if(tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(500, "Failed to delete tweet");
    }
    res.status(200).json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
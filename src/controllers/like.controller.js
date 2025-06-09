import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
const userId = req.user._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
const video = await Video.findById(videoId);
if (!video) throw new ApiError(404, "Video not found");

  const isVideoLiked = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (!isVideoLiked) {
    const videoLike = await Like.create({
      video: videoId,
      likedBy: userId,
    });
    if (!videoLike) {
      throw new ApiError(500, "Failed to like the video");
    }
    return res.status(200).json(new ApiResponse(200, { isLiked: true }));
  } else {
    const videoLike = await Like.findOneAndDelete({
      video: videoId,
      likedBy: userId,
    });
    if (!videoLike) {
      throw new ApiError(500, "Failed to unlike the video");
    }
    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

    const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
    }
  const isCommentLiked = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (!isCommentLiked) {
    const commentLike = await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    if (!commentLike) {
      throw new ApiError(500, "Failed to like the comment");
    }
    return res.status(200).json(new ApiResponse(200, { isLiked: true }));
  } else {
    const commentLike = await Like.findOneAndDelete({
      comment: commentId,
      likedBy: userId,
    });
    if (!commentLike) {
      throw new ApiError(500, "Failed to unlike the comment");
    }
    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
const userId = req.user._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

    const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
    }

  const isTweetLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (!isTweetLiked) {
    const tweetLike = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!tweetLike) {
      throw new ApiError(500, "Failed to like the tweet");
    }
    return res.status(200).json(new ApiResponse(200, { isLiked: true }));
  } else {
    const tweetLike = await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: userId,
    });
    if (!tweetLike) {
      throw new ApiError(500, "Failed to unlike the tweet");
    }
    return res.status(200).json(new ApiResponse(200, { isLiked: false }));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          { $unwind: "$ownerDetails" },
        ],
      },
    },
    { $unwind: "$likedVideo" },
    {
      $project: {
        _id: 0,
        likedVideo: {
          _id: "$likedVideo._id",
          videoFile: "$likedVideo.videoFile.url",
          thumbnail: "$likedVideo.thumbnail.url",
          owner: "$likedVideo.owner",
          title: "$likedVideo.title",
          description: "$likedVideo.description",
          views: "$likedVideo.views",
          duration: "$likedVideo.duration",
          createdAt: "$likedVideo.createdAt",
          isPublished: "$likedVideo.isPublished",
          ownerDetails: {
            username: "$likedVideo.ownerDetails.username",
            fullName: "$likedVideo.ownerDetails.fullName",
            avatar: "$likedVideo.ownerDetails.avatar.url",
          },
        },
      },
    },
    {
      $sort: {
        "likedVideo.createdAt": -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});


export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

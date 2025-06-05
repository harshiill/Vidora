import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async(req,res) => {

        const userId = req.user?._id;


    if(!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const totalSubscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group:{
                _id:null,
                totalSubscribers: { $sum: 1 }
            }
        }
    ])

    const totalSubscriptions = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(userId)
                }
        },
        {
            $group:{
                _id:null,
                totalSubscriptions: { $sum: 1 }
                }
        }
    ])
        
    const totalViews = await Video.aggrgate([
        {
          $match:{
            owner: new mongoose.Types.ObjectId(userId)
        }  
        },
        {
            $lookup:{
                from:"likes",
                localField: "_id",
                ForeignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
            }
        },
        {
            $group:
            {
                _id: null,
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$totalLikes" },
                totalVideos: { $sum: 1 }
                

                
            }
        }
        
    ])

    return res.status(200).json(
        new ApiResponse(200, "Channel stats fetched successfully", {
            totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
            totalSubscriptions: totalSubscriptions[0]?.totalSubscriptions || 0,
            totalViews: totalViews[0]?.totalViews || 0,
            totalLikes: totalViews[0]?.totalLikes || 0,
            totalVideos: totalViews[0]?.totalVideos || 0
        })
    )
})

const getChannelVideos = asyncHandler(async(req,res) => {
    const userId = req.user._id
    if(!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    
    const Videos = await Video.aggregate([
        {
        $match:{
            owner: new mongoose.Types.ObjectId(userId)
        }
    },
        {
            $lookup:{
                from:"likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            addFields:{
                likesCount:{
                    $size: "$likes"
                }
            }
        },{
            $sort: {
                createdAt: -1
            }
        },{
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                
                title: 1,
                description: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1
                },
                isPublished: 1,
                likesCount: 1
            }
        }


])

return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "channel stats fetched successfully"
        )
    )

})

export {
    getChannelStats,
    getChannelVideos
}
import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from './../utils/asyncHandler.js';
import ApiError from "../utils/APIErros.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._id
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    })
    if(!existingSubscription) {
        // Create a new subscription
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: userId
        })
        if (!newSubscription) {
            throw new ApiError(500, "Failed to subscribe to the channel")
        }
        return res.status(201).json(new ApiResponse(201, {isSubscribed: true}, "Subscribed successfully"))
    }
    else
    {
        // Delete the existing subscription
        const deletedSubscription = await Subscription.findOneAndDelete({
            channel: channelId,
            subscriber: userId
        })
        if (!deletedSubscription) {
            throw new ApiError(500, "Failed to unsubscribe from the channel")
        }
        return res.status(200).json(new ApiResponse(200, {isSubscribed: false}, "Unsubscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $sort: {
                createdAt: -1 // Sort by subscription date, most recent first
            }
        }

    ])
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
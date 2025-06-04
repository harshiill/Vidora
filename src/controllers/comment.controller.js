import mongoose, { isValidObjectId } from "mongoose";
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {page =1, limit=10} = req.query
    
    const videoIdIsValid = isValidObjectId(videoId)
    if(!videoIdIsValid){
        throw new ApiError(400, "Invalid video ID")
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId)

    const commentsAggregate = await Comment.aggregate([
        {
            $match:{
                video: videoObjectId
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup:{
                from:"likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        
        {
            $addFields:{
                owner:{
                    $arrayElemAt: ["$owner", 0]
                },
                
                likesCount: {
                    $size: "$likes"
                },
                isLiked:{
                    $cond:{
                        if: {
                            $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            },
            

        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                owner:{
                    username: 1,
                    fullname: 1,
                    avatar: 1
                },
                likesCount: 1,
                isLiked: 1
            }
        }
    ])

    const options={
        page:parseInt(page,1),
        limit:parseInt(limit,10),
    }

    const comments = await Comment.aggregatePaginate(commentsAggregate, options)
    return res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", comments)
    )
})

const addComment = asyncHandler(async(req,res)=> {
    const {content} = req.body
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required")
    }

    const video= await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }
    const videoObjectId = new mongoose.Types.ObjectId(videoId)
    
    const comment = await Comment.create({
        content: content,
        video: videoObjectId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(500, "Failed to add comment")
    }

    return res.status(201).json(
        new ApiResponse(201, "Comment added successfully", comment)
    )
    
})

const updateComment = asyncHandler(async(req,res) => {
    const {content} = req.body

    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required")
    }
    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    commentObjectId = new mongoose.Types.ObjectId(commentId)

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this comment")
    }
    const updatedComment = await Comment.findByIdAndUpdate(comment?._id, {
        $set: {
            content: content
        }
    },{
        new: true,
        runValidators: true
    }
    );

    if(!updatedComment){
        throw new ApiError(500, "Failed to update comment")
    }

    return res.status(200).json(
        new ApiResponse(200, "Comment updated successfully", updatedComment)
    )


})

const deleteComment = asyncHandler(async(req,res) => {
    const {commentId} = req.params 

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

     if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(comment?._id)

    await Like.deleteMany({comment: comment._id})

    return res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully")
    )
})
export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment

}
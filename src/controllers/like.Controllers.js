import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.Model.js"
import { Video } from "../models/video.Model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video   // complete

    const { videoId } = req.params
    const userid = req.user._id




    if (!userid) {
        throw new ApiError(500, "user id not found")
    }

    if (!videoId) {
        throw new ApiError(400, 'videoid is required')
    }

    try {

        const alreadyLike = await Like.findOne({
            video: videoId,
            likedBy: userid

        })


        if (alreadyLike) {
            await Like.findByIdAndDelete(alreadyLike._id)
            return res.status(200)
                .json(new ApiResponse(200, alreadyLike, "toggle successfully done with deleting"));


        }

    } catch (error) {
        throw new ApiError(400, "error in togglevideolike ")
        console.log(error)

    }


    const video = await Like.create({
        video: videoId,
        likedBy: userid
    })

    if (!video) {
        throw new ApiError(500, "something went worng adding like")
    }


    return res.status(200)
        .json(new ApiResponse(200, video, "toggle successfully done with adding"));



})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment       // complete

    const { commentId } = req.params
    const userid = req.user._id


    if (!commentId) {
        throw new ApiError(400, "commentId is required")
    }


    try {

        const alreadyLike = await Like.findOne({
            comment: commentId,
            likedBy: userid

        })


        if (alreadyLike) {
            await Like.findByIdAndDelete(alreadyLike._id)
            return res.status(200)
                .json(new ApiResponse(200, alreadyLike, "toggle successfully done with deleting"));


        }

    } catch (error) {
        throw new ApiError(400, "error in toggleCommentlike ")
        console.log(error)

    }





    const comment = await Like.create({
        comment: commentId,
        likedBy: userid
    })

    if (!comment) {
        throw new ApiError(500, "something went worng adding like")
    }


    return res.status(200)
        .json(new ApiResponse(200, comment, "toggle successfully done with adding"));







})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet   // comment
    const { tweetId } = req.params
    const userid = req.user._id


    if (!tweetId) {
        throw new ApiError(400, "tweetid is required ")
    }


    try {

        const alreadyLike = await Like.findOne({
            tweet: tweetId,
            likedBy: userid

        })


        if (alreadyLike) {
            await Like.findByIdAndDelete(alreadyLike._id)
            return res.status(200)
                .json(new ApiResponse(200, alreadyLike, "toggle successfully done with deleting"));


        }

    } catch (error) {
        throw new ApiError(400, "error in toggleTweetlike ")
        console.log(error)

    }



    const tweet = await Like.create({
        tweet: tweetId,
        likedBy: userid
    })

    if (!tweet) {
        throw new ApiError(500, "something went worng adding like")
    }


    return res.status(200)
        .json(new ApiResponse(200, tweet, "toggle successfully done with adding"));





}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos     // complete

    const userid = req.user._id
    
    if (!userid) {
        throw new ApiError(400, "userid is required")
    }
    
   
    
    const likedVideos = await Like.aggregate([
        {
            $match: {

                likedBy: userid

            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos"

            }
        },
        {
            $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                owner: 1,
                videos: { $arrayElemAt : ["$videos",0] }
            }
        }
    ])



    if (!likedVideos) {
        throw new ApiError(500, "something worng ewhile geting likedvideos")
    }

 

    return res.status(200)
        .json(new ApiResponse(200, likedVideos, "liked videos successfully feched"))



});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
import mongoose from "mongoose"
import { Video } from "../models/video.Model.js"
import { Subscription } from "../models/subscription.Model.js"
import { Like } from "../models/like.Model.js"
import { Comment } from "../models/comment.Model.js"
import { Tweet } from "../models/tweet.Model.js"

import { User } from "../models/user.Model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userid = req.user._id
    const anyuserid = req.params

    if (!userid) {
        throw new ApiError("User not found", 404)
    }

    const videoandviews = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userid) } },

        {
            $lookup: {
                from: "videos",
                localField: "userid",
                foreignField: "owner",
                as: "videoDetails"
            }
        },

        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        {
            $lookup: {
                from: "tweets",
                localField: "userid",
                foreignField: "user",
                as: "tweets"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "commentsl",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "comment",
                            as: "likes",

                        }
                    }
                ]

            }
        },



        {
            $group: {

                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalComments: { $first: { $size: "$comments" } },
                totalSubscribers: { $first: { $size: "$subscribers" } },
                totalTweets: { $first: { $size: "$tweets" } },
                totalVideoLikes: { $sum: { $size: "$likes" } },
                totalCommentLikes: {
                    $sum: {
                        $sum: {
                            $map: {
                                input: "$commentsl",
                                as: "comment",
                                in: { $size: "$$comment.likes" }
                            }
                        }
                    }
                }
            }
        },







        {
            $project: {

                // _id: 0,
                totalViews: 1,
                totalVideos: 1,
                totalComments: 1,
                totalSubscribers: 1,
                totalTweets: 1,
                totalVideoLikes: 1,
                totalCommentLikes:1
            }
        }

    ])


    console.log(videoandviews)
    if (!videoandviews?.length) {
        throw new ApiError("No videos found for this channel", 404)
    }

    return res.status(200).json(new ApiResponse(200, videoandviews, "Channel stats fetched successfully"))

})



const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

})



export {
    getChannelStats,
    getChannelVideos
}



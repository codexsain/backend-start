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
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.   // complete

    const userid = req.user._id
    const anyuserid = req.params

    if (!userid) {
        throw new ApiError("User not found", 404)
    }

    const userChannelData = await Video.aggregate([

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
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },


        // no t needed to use 
        // {
        //     $lookup: {
        //         from: "comments",
        //         localField: "_id",
        //         foreignField: "video",
        //         as: "comments"
        //     }
        // },

        // {
        //     $lookup: {
        //         from: "tweets",
        //         localField: "owner",
        //         foreignField: "owner",
        //         as: "tweets",

        //     }
        // },




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
            $lookup: {
                from: "tweets",
                localField: "owner",
                foreignField: "owner",
                as: "tweetsl",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "tweet",
                            as: "likes"

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
                totalComments: { $sum: { $size: "$commentsl" } },
                totalSubscribers: { $first: { $size: "$subscribers" } },
                totalTweets: { $first: { $size: "$tweetsl" } },
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
                },
                totaltweetLikes: {
                    $first: {
                        $sum: {
                            $map: {
                                input: "$tweetsl",
                                as: "tweet",
                                in: { $size: "$$tweet.likes" }
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
                totalCommentLikes: 1,
                totaltweetLikes: 1
            }
        }

    ])


    console.log(userChannelData)

    if (!userChannelData?.length) {
        throw new ApiError("No videos found for this channel", 404)
    }

    return res.status(200).json(new ApiResponse(200, userChannelData, "Channel stats fetched successfully"))

})


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel   // complete

    const userid = req.user._id  
    // const useid = req.user._id  // if you want to get videos of the logged in user

    if (!userid) {
        throw new ApiError("User not found", 404)
    }
    
    const allvideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userid),

                isPublished:true
            }
        },

        {
            $project: {

                _id: 1,
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: 1,
                isPublished:1

            }
        }

      
    ])


    if (!allvideos?.length) {
        throw new ApiError("No videos found for this channel", 404)
    }


    return res.status(200).json(new ApiResponse(200, allvideos, "Channel videos fetched successfully"))

})



export {
    getChannelStats,
    getChannelVideos
}



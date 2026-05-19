import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.Model.js"
import { User } from "../models/user.Model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet       // compleate
    const { content } = req.body
    const userId = req.user._id

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    if (! await mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const tweet = await Tweet.create(

        {
            content,
            owner: userId
        }
    )

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }


    return res.
        status(201)
        .json(new ApiResponse(true, tweet, "Tweet created successfully"))






})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets           // compleate
    const userId = req.params.userId
    const userIdCheak = await User.findById(userId)
    if (!userIdCheak) {
        throw new ApiError(404, "User not found with this ID")
    }
    // const userId = req.user._id       // we  can also use this to get tweets of login user only

    if (! await mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const tweets = await Tweet.aggregate([

        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },

        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: 1
            }
        }
    ])

    if (!tweets) {
        throw new ApiError(404, "Tweets not found")
    }


    return res.status(200).json(new ApiResponse(200, tweets, "User tweets retrieved successfully"))


})

const updateTweet = asyncHandler(async (req, res) => {
    // TODO: update tweet          // compleate


    // const userId = req.user._id  //  i dont think i need this 
    const tweetId = req.params.tweetId
    const { content } = req.body

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    const tweetIdCheak = await Tweet.findById(tweetId)

    if (!tweetIdCheak) {
        throw new ApiError(404, "Tweet not found with this ID")
    }



    if (!content && undefined) {
        throw new ApiError(400, "Content is required")
    }
    if (! await mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: {
                content: content
            },
        },

        {
            returnDocument: 'after'
        }


    )

    if (!updatedTweet) {
        throw new ApiError(500, "something went wrong while updating the tweet")
    }

    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet        conpleate
    const tweetId = req.params.tweetId

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    const tweetIdCheak = await Tweet.findById(tweetId)

    if (!tweetIdCheak) {
        throw new ApiError(404, "Tweet not found with this ID")
    }

    if (! await mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    try {
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    } catch (error) {
        console.error("Error while deleting tweet:", error)
    }

    return res.status(200).json(new ApiResponse(200, "", "Tweet deleted successfully"))

})




export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.Model.js"
import { Subscription } from "../models/subscription.Model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription     // complete

    const { channelId } = req.params
    const userid = req.user._id

    if (!channelId) {
        throw new ApiError(400, "channel id required")
    }

    if (channelId == userid) {
        throw new ApiError(400, "you cannot subscribe your own channel")
    }

    const alreadysub = await Subscription.findOne({
        subscriber: userid,
        channel: channelId

    })


    if (alreadysub) {
        await Subscription.findByIdAndDelete(alreadysub._id)
        return res.status(200).json(new ApiResponse(200, alreadysub, "unsubscribed channel successfully done "))
    }




    const subscribed = await Subscription.create({
        subscriber: userid,
        channel: channelId

    })

    if (!subscribed) {
        throw new ApiError(500, "something while wornge while subscribe channel")
    }

    return res.
        status(200)
        .json(new ApiResponse(200, subscribed, "subscribe channel successfully done "));






})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    // controller to return subscriber list of a channel    // complete

    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "channell id is required")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        // {
        //     $lookup: {
        //         from: "users",
        //         localField: "subscriber",
        //         foreignField: "_id",
        //         as: "subscribers"                  // to get subscriber data
        //     }
        // },


        {
            $project: {
                _id: 1,
                // channel: 1,
                subscriber: 1,
                // subscribers: {

                //     $arrayElemAt: ["$subscribers", 0 ],        // to get subscriber data 

                // }
            }
        }

    ])

    if (!subscribers) {
        throw new ApiError(500, "something went wornge while geting channel subscribers")
    }



    return res.status(200).json(new ApiResponse(200, subscribers, `subscribers feched successfully [TottleSub: ${subscribers.length}]`))




})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    // controller to return channel list to which user has subscribed   // complete

    const { subscriberId } = req.params


    if (!subscriberId) {
        throw new ApiError(400, "subscriberId is required")
    }


    const channels = await Subscription.aggregate([

        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)

            }
        },


        {
            $project: {
                _id: 1,
                channel: 1,
                // subscriber: 1,

            }
        }
    ])

    if (!channels?.length) {
        throw new ApiError(500, "something went wornge while geting subcribed channels")
    }
    
    return res.status(200).json(new ApiResponse(200 , channels , `channels feched successfully [TottleChannels: ${channels.length}]`))



})





export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.Model.js"
import { User } from "../models/user.Model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, destroyOnCloudinary, destroyOnCloudinaryForVideo } from "../utils/cloudnary.js"


 // mongoDb aggregation pipeline use on this function

const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination      // compleate

    let { page, limit, query, sortBy, userId } = req.query

    page = parseInt(page)
    limit = parseInt(limit)


    let titleVariable = query
    const skip = (page - 1) * limit;
    const hasTitle = query && query.trim() !== "";




    // MongoDB Aggregation
    let video = await User.aggregate([


        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },


        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
            }
        },

        

        {
            $project: {
                _id: 1,
                videos: {
                    $map: {
                        input: hasTitle
                            ? {
                                $filter: {
                                    input: "$videos",
                                    as: "video",
                                    cond: {
                                        $eq: ["$$video.title", query]
                                    }
                                }
                            }
                            : "$videos",  // If titleVariable is empty, use all videos
                        as: "video",
                        in: {
                            _id: "$$video._id",
                            videoFile: "$$video.videoFile",
                            thumbnail: "$$video.thumbnail",
                            title: "$$video.title",
                            description: "$$video.description",
                            duration: "$$video.duration",
                            views: "$$video.views",
                            owner: "$$video.owner",
                            sortValue: `$$video.${sortBy}`

                        }
                    }
                }
            }
        },

        // Step 4: Unwind videos array to paginate
        {
            $unwind: "$videos"
        },


        // Step 5: Skip documents based on page
        {
            $skip: skip
        },

        // Step 6: Limit documents based on limit
        {
            $limit: limit
        },

        // Step 7: Group back videos array
        {
            $group: {
                _id: "$_id",
                videos: { $push: "$videos" }
            }
        },



    ])





    console.log(video)

    if (!video?.length) {
        throw new ApiError(404, "video dose not exist")

    }

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "videos fetched successfully"));




})



const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    // get video, upload to cloudinary, create video   // compleate

    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }




    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path



    if (!videoLocalPath && !thumbnailLocalPath) {
        throw new ApiError(400, "Video  and thumbnail file is required")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)



    if (!videoLocalPath && !thumbnailLocalPath) {
        throw new ApiError(400, "Video  and thumbnail file is required")
    }


    const videoP = await Video.create({
        title: title.trim().toLowerCase(),
        description,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        owner: req.user._id,
        duration: video.duration,
        isPublished: true,
        thumbnailPublicId: thumbnail.public_id,
        videoPublicId: video.public_id

    })


    res
        .status(201)
        .json(new ApiResponse(200, videoP, "video create successfully"));


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // get video by id   // compleate
    const video = await Video.findById(videoId).select("-videoPublicId -thumbnailPublicId")

    if (!video) {
        throw new ApiError(404, "video not found with this ID")
    }
    
    return res
        .status(201)
        .json(new ApiResponse(200, video, "video fetched successfully"));

})

const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    // update video details like title, description  // compleate

    if (!videoId) {

        throw new ApiError(400, "video id is required")

    }
     
    const videoIdCheak = await Video.findById(videoId)

    if (!videoIdCheak) {
        throw new ApiError(404, "video not found with this ID")
    }

    const { title, description } = req.body

    if (!title || !description) {

        throw new ApiError(400, " minumim title or description are required")

    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,

        {
            $set: {
                title: title.trim().toLowerCase(),
                description,

            },
        },

        {
            new: true,
        }).select("-videoPublicId -thumbnailPublicId")


    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "video details updated successfully"));


})

const updateVideothumbnail = asyncHandler(async (req, res) => {

    // update video thumbnail only compleate

    const { videoId } = req.params
    if (!videoId) {

        throw new ApiError(400, "video id is required")
    }


    const video = await Video.findById(videoId)

    if (!video) {

        throw new ApiError(404, "video not found with this ID")
    
    }

    const thumbnailPID = await video.thumbnailPublicId


    await destroyOnCloudinary(thumbnailPID)   // chances of geting error on this code



    const thumbnailLocalPath = req.file.path

    console.log(req.files?.path)

    console.log("thumbnailLocalPath", thumbnailLocalPath)


    if (!thumbnailLocalPath) {

        throw new ApiError(400, "thumbnail file is required")
    }


    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {

        throw new ApiError(500, "error while uploading thumbnail")
    }

    const updatedThumbnail = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                thumbnailPublicId: thumbnail.public_id,
            }

        },

        {
            new: true,
        }

    )


    return res
        .status(200)
        .json(new ApiResponse(200, updatedThumbnail, "thumbnail updated successfully"));



})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video         compleate
    const { videoId } = req.params
    
    if (!videoId) {

        throw new ApiError(400, "video id is required")
    }
   const videoIdCheak = await Video.findById(videoId)

    if (!videoIdCheak) {
        throw new ApiError(404, "video not found with this ID")
    }

    const videoOFU = await Video.findById(videoId)


    const thumbnailPID = videoOFU.thumbnailPublicId
    const videoPID = videoOFU.videoPublicId

    console.log("thumbnailPID", thumbnailPID)
    console.log("videoPID", videoPID)

    if (!videoPID) {

        throw new ApiError(404, "video public id  not found with this id")
    }

    if (!thumbnailPID) {
        throw new ApiError(400, "thumbnail public id not found for this video")
    }


    const video = await destroyOnCloudinaryForVideo(videoPID)
    const thumbnail = await destroyOnCloudinary(thumbnailPID)


    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, "", "video deleted successfully"));



})

const togglePublishStatus = asyncHandler(async (req, res) => {

    //   togglePublishStatus          compleate

    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "video id is required")

    }



    const ispublishedx = await Video.findById(videoId)

    if (!ispublishedx) {
        throw new ApiError(500, "something went wornge while geting ispublished data")
    }


    if (ispublishedx.isPublished === true) {

        const IsPublishedfalse = await Video.findByIdAndUpdate(videoId,
            {
                $set: {

                    isPublished: false
                }
            },
            {
                returnDocument: 'after'
            }
        )
        return res
            .status(200)
            .json(new ApiResponse(200, IsPublishedfalse, "Published status updateing succesfully done"));

    }


    if (ispublishedx.isPublished === false) {
        console.log(Video.isPublished)

        const IsPublishedtrue = await Video.findByIdAndUpdate(videoId,
            {
                $set: {

                    isPublished: true
                }
            },

            {
                returnDocument: 'after'
            }
        )

        return res
            .status(200)
            .json(new ApiResponse(200, IsPublishedtrue, "Published status updateing succesfully done"));


    }




})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideothumbnail
}
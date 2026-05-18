import mongoose from "mongoose"
import { Comment } from "../models/comment.Model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    
    //TODO: get all comments for a video    // complet

    const { videoId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },

        {
            $skip: skip
        },
        {
            $limit: limit
        },
        // {
        //     $lookup: {
        //         from: "users",  // Change to your actual user collection name
        //         localField: "owner",
        //         foreignField: "_id",
        //         as: "ownerDetails"
        //     }
        // },
        {
            $project: {
                _id: 1,
                content: 1,
                owner: 1,
                video: 1,
                createdAt: 1,
                updatedAt: 1,
                // ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] }  // Optional: get owner details
            }
        }
    ]);




    if (!comments) {
        throw new ApiError(500, "somthing worng while geting video comments")
    }

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));


});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video     // complete

    const { videoId } = req.params
    const userId = req.user._id
    const { content } = req.body


    if (!userId) {
        throw new ApiError(500, "user id is required")
    }

    if (!content && content.trim() === "" && !videoId) {
        throw new ApiError(400, "content , videoId , userId , All fields are required")
    }


    const comment = await Comment.create({
        content,
        owner: userId,
        video: videoId
    })


    if (!comment) {
        throw new ApiError(500, "Failed to add comment")
    }

    console.log(comment)
    res.
        status(201)
        .json(new ApiResponse(200, "Comment added successfully", comment))



})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment        // complete
    const { commentId } = req.params
    const { content } = req.body

    console.log(commentId)
    console.log(content)

    if (!commentId) {
        throw new ApiError(400, "comment id is required")

    }

    if (!content || content.trim == "") {
        throw new ApiError(400, "content is required")

    }


    const updatedComment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {

                content: content
            }
        },

        {
            new: true
        }
    )

    if (!updatedComment) {
        throw new ApiError(500, 'something went worng while updateing comment ')
    }


    res.
        status(200)
        .json(new ApiResponse(200, updatedComment, "comment updated successfully"))



})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment          //  complete
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "commentID is required")
    }

    const dcommentid = await Comment.findByIdAndDelete(commentId)

    if (!dcommentid) {
        throw new ApiError(500, "something went wornge while deleteing comment ")
    }

    res.
        status(201)
        .json(new ApiResponse(200, '', "comment successfully  deleted"))

})







export {

    getVideoComments,
    addComment,
    updateComment,
    deleteComment

}


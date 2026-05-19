import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.Model.js"
import { Video } from "../models/video.Model.js"
import { Playlist } from "../models/playlist.Model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"






const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist   // compleated


    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const userId = req.user._id

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }


    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))








})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists      // compleated
    const { userId } = req.params

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const userIdCheak = await User.findById(userId)
    if (!userIdCheak) {
        throw new ApiError(404, "User not found with this ID")
    }


    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "Playlist",
                localField: userId,
                foreignField: "owner",
                as: "playlists"
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videos: 1,
                owner: 1
            }
        }

    ])




    if (!playlists) {
        throw new ApiError(404, "Playlists not found")
    }

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"))



})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id            // compleated
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found with this ID")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"))


})

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    // TODO: add video to playlist     // compleated
    const { playlistId, videoId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const videoIdCheak = await Video.findById(videoId)
    const playlistIdCheak = await Playlist.findById(playlistId)


    if (!videoIdCheak) {
        throw new ApiError(404, "Video not found with this ID")
    }
    if (!playlistIdCheak) {
        throw new ApiError(404, "Playlist not found with this ID")
    }




    const PaddedVideo = await Playlist.findByIdAndUpdate(

        playlistId,

        {
            $set: {

                videos: videoId

            }
        },
        {
            returnDocument: 'after'
        }

    )

    if (!PaddedVideo) {
        throw new ApiError(500, "Failed to add video to playlist")
    }

    return res.
        status(200)
        .json(new ApiResponse(200, PaddedVideo, "Video added to playlist successfully"))





})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    // TODO: remove video from playlist
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const videoIdCheak = await Video.findById(videoId)
    const playlistIdCheak = await Playlist.findById(playlistId)

    if (!playlistIdCheak.videos.includes(videoId)) {
        throw new ApiError(400, "Video is not in the playlist")
    }

    if (!videoIdCheak) {
        throw new ApiError(404, "Video not found with this ID")
    }

    if (!playlistIdCheak) {
        throw new ApiError(404, "Playlist not found with this ID")
    }




    const removedVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {
                videos: videoId
            }
        },

        {
            returnDocument: 'after'
        }
    )

    if (!removedVideo) {
        throw new ApiError(500, "Failed to remove video from playlist")
    }
    console.log(removedVideo)

    return res.status(200).json(new ApiResponse(200, removedVideo, "Video removed from playlist successfully"))





})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist        // compleated
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlistIdCheak = await Playlist.findById(playlistId)

    if (!playlistIdCheak) {
        throw new ApiError(404, "Playlist not found with this ID")
    }


    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)


    if (!deletedPlaylist) {
        throw new ApiError(500, "Failed to delete playlist")
    }

    return res.status(200).json(new ApiResponse(200, "", "Playlist deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist             // compleated
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    if (!name || !description) {
        throw new ApiError(400, "At least one field (name or description) is required to update")
    }

    const playlistIdCheak = await Playlist.findById(playlistId)

    if (!playlistIdCheak) {
        throw new ApiError(404, "Playlist not found with this ID")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set: {
                name: name || playlistIdCheak.name,
                description: description || playlistIdCheak.description

            }
        },
        {
            returnDocument: 'after'
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to update playlist")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))

})






export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
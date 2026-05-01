import { asyncHandler } from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.Model.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {


    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "  unauthorized request  ")
        }




        const decodeedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodeedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "  invalid accestoken   ")
        }


        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "  invalid access token  ")
    }


})
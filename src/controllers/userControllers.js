import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.Model.js';
import { uploadOnCloudinary } from '../utils/Cloudnary.js';
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res, next) => {

    // get user details from frontend
    // validate not empty
    // check if user already exists by email and username
    // check for image  and avatar
    // upload them to cloudinary atlest avatar
    // create user abject and create entry in  database
    // remove password and refresh token from response
    // check for user creation 
    // return response 

    const { fullName, username, email, password } = req.body;


    // console.log(username, email, password)
    

    if (

        [fullName, username, email, password].some((field) => field?.trim() === "")

    ) {
        throw new ApiError(400, "All fields are required")

    }


    const existedUser = await  User.findOne({ $or: [{ email }, { username }] })

    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;



    // let coverImageLocalPath ;   // same working like this code as above code 
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }







    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }



    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password,

    })


   const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering  user")
    }



    res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))





})


export { registerUser } 
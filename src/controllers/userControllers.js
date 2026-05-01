import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.Model.js';
import { uploadOnCloudinary } from '../utils/Cloudnary.js';
import { ApiResponse } from '../utils/ApiResponse.js'





const generateAccessAndRefreshTokens = async (UserId) => {





    try {

        const userAR = await User.findById(UserId)
        const accessToken = userAR.generateAccessToken()
        const refreshToken = userAR.generateRefreshToken()

        userAR.refreshToken = refreshToken

        await userAR.save({ ValidateBeforeSave: false })

        return { accessToken, refreshToken }



    }
    catch (error) {

        throw new ApiError(500, "something went worng while generateing access and refresh tokens ")

    }





}






const registerUser = asyncHandler(async (req, res) => {

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


    const existedUser = await User.findOne({ $or: [{ email }, { username }] })

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







const loginUser = asyncHandler(async (req, res) => {


    // req.body => data
    // username or email and password
    //find user by email or username
    //password check
    //access token and refresh token
    // send cookies 
    // return response


    const { username, email, password } = req.body;

    if (!(username || email)) {

        return new ApiError(400, "Username or email is required")

    }


    const userA = await User.findOne({

        $or: [{ email }, { username }]

    })


    if (!userA) {
        throw new ApiError(404, "User not found with this email or username")
    }



    const isPasswordValid = await userA.isPasswordCorrect(password)       // chances to geting error from this code

    //  const isPasswordValid =   await User.isPasswordCorrect(password )

    if (!isPasswordValid) {
        throw new ApiError(401, " password is invalid ")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(userA._id)



    const loggedInUser = await User.findById(userA._id).select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true

    }




    return re
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(

            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                " user logged in successfully"
            )

        )




})







const logOutUser = asyncHandler(async (req, res) => {

   await User.findByIdAndUpdate(req.user._id,

        {

              $set: {
                refreshToken: undefined
              }


        },
        {

          new: true


        }
    
    )

    
    const options = {
        httpOnly: true,
        secure: true

    }


    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
        new ApiResponse(200, {}, "user logged out successfully")
    )


})








export {

    registerUser,
    loginUser,
    logOutUser

} 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.Model.js";
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/Cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const generateAccessAndRefreshTokens = async (UserId) => {
    try {
        const userAR = await User.findById(UserId);
        const accessToken = userAR.generateAccessToken();
        const refreshToken = userAR.generateRefreshToken();

        userAR.refreshToken = refreshToken;

        await userAR.save({ ValidateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went worng while generateing access and refresh tokens "
        );
    }
};




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
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath ;   // same working like this code as above code
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);



    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password,
        avatarPublicId: avatar.public_id,
        coverImagePublicId: coverImage.public_id

    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering  user");
    }

    res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));
});




const loginUser = asyncHandler(async (req, res, next) => {
    // req.body => data
    // username or email and password
    //find user by email or username
    //password check
    //access token and refresh token
    // send cookies
    // return response

    const { email, username, password } = req.body;

    if (!(username || email)) {
        // res.status(400).json({ error: "Username or email is required" })

        return next(new ApiError(400, "Username or email is required"));
    }

    const userA = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!userA) {
        throw new ApiError(404, "User not found with this email or username");
    }

    const isPasswordValid = await userA.isPasswordCorrect(password); // chances to geting error from this code

    //  const isPasswordValid =   await User.isPasswordCorrect(password )

    if (!isPasswordValid) {
        throw new ApiError(401, " password is invalid ");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        userA._id
    );

    const loggedInUser = await User.findById(userA._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                " user logged in successfully"
            )

        )

})


const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,

        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"));
});




const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomeingRefreshToken = req.refreshToken || req.body.refreshToken;

    if (!incomeingRefreshToken) {
        // maybe i need to use next() on this code like before
        throw new ApiError(401, "unauthorize request ");
    }

    try {
        const decodedToken = jwt.verify(
            incomeingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const userD = await User.findById(decodedToken?._id);

        if (!userD) {
            throw new ApiError(401, " refrest token ");
        }

        if (incomeingRefreshToken !== userD?.refreshToken) {
            throw new ApiError(401, "refresh token invalid or used ");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshTokens(userD._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "INVALID REFRESH TOKEN");
    }
});



const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const ispasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!ispasswordValid) {
        // maybe i need to use next() on this code like before
        throw new ApiError(400, "old password is incorrect");
    }

    user.password = await newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"));
});



const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});



const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        // maybe i need to use next() on this code like before but for noew i am nopt sure
        throw new ApiError(400, "fullName or email is required to update");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                fullName,
                email,
            },
        },

        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "account details updated successfully"));
});




const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file.path;

    if (!avatarLocalPath) {
        // maybe i need to use next() on this code like before but for now i am not sure
        throw new ApiError(400, "avatar file is missing");
    }

    console.log(req.user.avatarPublicId)
    await destroyOnCloudinary(req.user.avatarPublicId)


    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(
            500,
            "something went wrong while uploading avatar on cloudinary"
        );
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
                avatarPublicId: avatar.public_id

            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        // maybe i need to use next() on this code like before but for now i am not sure
        throw new ApiError(400, "cover image file is missing");
    }


    console.log(req.user.coverImagePublicId)
    await destroyOnCloudinary(req.user.coverImagePublicId)




    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(
            500,
            "something went wrong while uploading cover image on cloudinary"
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
                coverImagePublicId: coverImage.public_id
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "cover image updated successfully"));
});



// mongoose Aggregate pipelines

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },

        {
            $lookup: {

                from: "subscriptions",
                localField: "_id",  // any unique field in user collection
                foreignField: "channel",  // user
                as: "subscribers",

            },


        },


        {
            $lookup: {

                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTO",
            },



        },


        {


            $addFields: {

                subscribersCount: {

                    $size: "$subscribers"
                },

                channelSubscribedTOCount: {
                    $size: "$subscribedTO"
                },

                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,

    
                    }
                }


            },




        },


        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubscribedTOCount: 1,
                isSubscribed: 1,
                email: 1,


            }
        }


    ]);







    if (!channel?.length) {
        throw new ApiError(404, "channel dose not exist")   

    }




 return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "channel profile fetched successfully"))






});








const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",


                
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        )
})




export {
    updateUserAvatar,
    updateUserCoverImage,
    logOutUser,
    loginUser,
    registerUser,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    refreshAccessToken,
    updateAccountDetails
}





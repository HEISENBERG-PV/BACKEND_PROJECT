import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { cloudinary_fileUpload } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
// import { application } from "express";



const generateAccessrefreshTokens = async (userid) => {
    try {
        const user = await User.findById(userid)
        // console.log(user);
        
        const refreshToken =  user.generateRefreshToken()
        const accessToken =  user.generateAccessToken()

        // console.log("accessToken",accessToken);
        // console.log("refreshToken",refreshToken);
        

        user.refreshToken = refreshToken // saving refesh token in user object to save it in the database
        await user.save({
            validateBeforeSave: false
        })

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "cannot generateAccessrefreshTokens")
    }
}

const options = {
        httpOnly: true,
        secure: true
}

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "okayy"
    // })

    // get data from the user
    // validate the data
    // check if user alredy exists
    // check images and avatar / user ne avatar upload kiya ki nhi
    // upload in cloudinary, check avatar ki avatr cloundinary pe upload hua ki nhi
    // user object creation
    // check user created or not
    // remove password or token 
    // return res


    // getting the data 
    const {fullname, username, email, password} = req.body
    // console.log("Req",req.body);
    
    // validation
    if([fullname, username, email, password].some((field) => 
        field?.trim() === ""
    )){
        throw new ApiError(404, "Fields cannot be Empty")
    }

    // check if user alredy exists
    const userExist = await User.findOne({
        $or: [{username}, {email}] 
    })

    // console.log("userExist",userExist);
    
    if(userExist){
        throw new ApiError(404, "Username Or Email Already Exist")
    }

    // check images
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // console.log("avatarLocalPath",avatarLocalPath);
    // console.log("coverImageLocalPath",coverImageLocalPath);
    
    
    if(!avatarLocalPath){
        throw new ApiError(404, "Avatar is Required")
    }

    // upload on cloundinary
    const avatar = await cloudinary_fileUpload(avatarLocalPath);
    const coverImage = await cloudinary_fileUpload(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(501, "Something went wrong");
    }
    // console.log(avatar);
    
    // create object for user and create entry in db

    const user = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    // console.log("user",user);
    
    // check user create or not and remove pssword and refreshToken

    const userRegistered = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userRegistered){
        throw new ApiError(501,user, "something went wrong")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, userRegistered, "User Registered Successfully")
    )

    /*const {fullname, username, email, password} = req.body

    if(fullname === "") throw new ApiError(401,"fullname reuired");
    if(username === "") throw new ApiError(401,"username reuired");
    if(email === "") throw new ApiError(401,"email reuired");
    if(password === "") throw new ApiError(401,"password reuired");

    const isuserAlreadyExist = await User.findOne({
        $or: [{username}, {email}]
    })

    if(isuserAlreadyExist){
        throw new ApiError(401, "user already exixt")
    }

    // check for images ad avatar

    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(401, "avatar required")
    }

    const avatar = await cloudinary_fileUpload(avatarLocalPath)
    const coverImage = await cloudinary_fileUpload(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(501,"somthing went wrong during cloundinary upload")
    }

    const userObject = await User.create({
        fullname,
        username,
        password,
        username: username.toLowerCase(),
        avatar: avatar?.url,
        coverImage: coverImage?.url || ""
    })

    if(!userObject){
        throw new ApiError(501, "something went wrong")
    }

    const user = await User.findById(userObject._id).select(
        "-password -refreshToken"
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "user logged in")
    )*/


})

const loginUser = asyncHandler( async (req, res) => {
    // req.body -> get data
    // login from which?? username of email.. (lets from both)
    // find user in the database
    // check password 
    // generate refresh and access token 
    // send cookies


    // get data
    // console.log(req.body);
    
    const {username, email, password} = req.body

    // check for username and email
    if(!(username && email)){
        throw new ApiError(404, "Username and Email required")
    }
    // checking for empty password 
    // if(password === ""){
    //     throw new ApiError(401, "Password cannot be empty")
    // }

    // finding user with usernmae or email
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    // console.log("user",user);
    

    // error if user doesnt exists
    if(!user){
        throw new ApiError(404, "Username or Email doesn't exists")
    }

    // check for correct password
    const isPasswordvalid = await user.ispasswordCorrect(password)
    // console.log("isPasswordvalid",isPasswordvalid);
    
    // error if password wrong
    if(!isPasswordvalid){
        throw new ApiError(400, "Password Wrong");
    }
    
    // generate tokens
    const { accessToken, refreshToken} = await generateAccessrefreshTokens(user._id)

    
    
    // kuki user ke browser pe password or refresh token nhi bhjna h isliye hme inn fields ko remove krna h user object me se
    const loggedInuser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!loggedInuser){
        throw new ApiError(501, "something went wrong")
    }
    console.log("accessToken",accessToken);
    console.log("refreshToken",refreshToken);
    console.log("loggedInuser",loggedInuser);

    const options = {
        httpOnly: true,
        secure: true
}
    
    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
         new ApiResponse(200,
            {user: loggedInuser, accessToken: accessToken, refreshToken: refreshToken},
            "user logged in"
         )
    )

    /*// get data
    // validate
    // find user
    // login user through username or email
    // generate access refresh token 
    // send them in cookies    
    
    console.log(req.body);
    
    const {username, email, password} = req.body

    if(!(username && email)){
        throw new ApiError(401, "username or email required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]  
    })

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if(!isPasswordvalid){
        throw new ApiError(401, "Password doesn't match")
    }
    
    const {accessToken, refreshToken} = await generateAccessrefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {loginUser, accessToken, refreshToken},
            "user loggeg_in"
        )
    )*/
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )


    // globalyy define krdia h mne ise upr
    // const option = {
    //     httpOnly: true,
    //     secure: true
    // }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User Loggedout")
    )

})

const accessTokenRefresh = asyncHandler( async (req, res) => {
    // get refesh token from cookie
    // check did token recieved or not
    // decode it
    // if not get decoded send error 
    // check token from user and decoded token
    // if not match send error 
    // if matched generate new token and send


    const tokenFromUser = req.cookies?.refreshToken || req.body.refreshToken

    if(!tokenFromUser){
        throw new ApiError(401, "token didn't received")
    }

    try { 
        const decodedToken = jwt.verify(tokenFromUser, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "invalid refresh token")
        }
        
        if(decodedToken !== user.refreshToken){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        const {accessToken, newrefreshToken} = await generateAccessrefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newrefreshToken, option)
        .json(
            new ApiResponse(200,
                {accessToken, refreshToken: newrefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error.message)
    }

    /*const token = req.cookies?.refreshToken || req.body.refreshToken

    if(!token){
        throw new ApiError(501, "didn't receive refresh token")
    }
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    if(!decodedToken){
        throw new ApiError(501, "something went wrong")
    }
    const user = await User.findById(decodedToken._id)
    if(token !== decodedToken){
        throw new ApiError(501, "unauthorized access")
    }
    const {accessToken, newrefreshToken} = await generateAccessrefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newrefreshToken, option)
        .json(
            new ApiResponse(200,
                {accessToken, refreshToken: newrefreshToken},
                "Access Token Refreshed"
            )
        )*/
})

/*const updateUserCurrentPassoword = asyncHandler( async (req, res) => {

    // taking confirmpassword also 


    // gt oldpassword and new password from req.body
    // find user from req.user as user is already logged in 
    //match oldpassword and newpassword
    // if doesn't match send error
    // if match --> user.password me save krdo newPassword ko
    // return res

    const {oldPassword, newPassword, confirmPassword} = req.body
    
    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.ispasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401, "old password doesn't match with current password")
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(401, {}, "newPassword and confirmPassword doesn't match")
    }

    user.password = newPassword
    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "password changed")
    )
    
})*/

const updateUserCurrentPassoword = asyncHandler ( async (req, res) => {

    const {oldpassword, newpassword, confirmpassword} = req.body

    const isOldpasswordCorrect = user.ispasswordCorrect(oldpassword)
    if(!isOldpasswordCorrect){
        throw new ApiError(401, "OldPassword doesn't match")
    }

    if(newpassword !== confirmpassword){
        throw new ApiError(401, "newPassword and confirmPassword doesn't match")
    }

    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(401, "unuthorized access")
    }
    user.password = newpassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Updated")
    )

})

const getCurrentUser = asyncHandler( async (req, res) => {

    // kuki user login h toh hm directly user ko return krr skte h
    // user login h yaa nhi iske liye hm auth.middleware ka use krenge
    const user = req.user
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {user},
            "current User fetched"
        )
    )
})

const updateAccountDetails = asyncHandler( async (req, res) => {

    // get details from user
    // check we receive it or not
    // find user and update it
    const {fullname, email} = req.body
    
    if(!(fullname || email)){
        throw new ApiError(401, "fullname and email required")
    }

    User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "fullname and email updated")
    )

})

/*const updateUserAvatar = asyncHandler( async(req, res) => {
    // local path for avatar -> req.files
    // check for path
    // upload on claundinary
    // save

    const localPathAvatar = req.file?.avatar[0]?.path

    if(!localPathAvatar){
        throw new ApiError(401, "path not found")
    }

    const avatar = await cloudinary_fileUpload(localPathAvatar)

    if(!avatar.url){
        throw new ApiError(500, "avatar not found")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar updated")
    )

    
})*/

const updateUserAvatar = asyncHandler ( async (req, res) => {
    // get avatar from req.file
    // upload on cloundniary
    // find user from req.user._id
    // update avatar

    const avatarLocalPath = req.file?.avatar[0].path

    if(!avatarLocalPath){
        throw new ApiError(401, "something went wrong")
    }

    const avatar = await cloudinary_fileUpload(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(401, "avatar url not found")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select(
        "-password -refresh"
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar updated")
    )

})

const updateCoverImage = asyncHandler ( async (req, res) => {
    // get coverImagepath
    // upload on cloundniary
    // find user through auth.middleware/ req.user
    // update it

    const coverImageLocalPath = req.file?.coverImage[0].path
    if(!coverImageLocalPath){
        throw new ApiError(400, {}, "CoverImage path is missing")
    }

    const coverImage = await cloudinary_fileUpload(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Something went wrong while uploading coverImage in cloundinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "CoverImage updated")
    )

})

const getUSerChannelProfile = asyncHandler ( async (req, res) => {
    // get data from link/params
    // there are 2 ways :-
    //    -> first find user
    //    -> directly apply aggregation with match operator which will help to find the user

    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(401, "didn't get the username")
    }

    // directly apply aggregation

    const channel = await User.aggregate([

        {   // it selects the document having same username only
            $match: {
                username: username?.toLowerCase()
            }
        },

        {   // it will slect only document where foreignfiled is "subscriber" and by adding all these documents we'll get num of channel user "subscribedto"
            
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "channel"
            }
        },

        {   // it will slect only document where foreignfiled is "channel" and by adding all these documents we'll get num of subscriber a channel have
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subcribers"
            }
        },

        {   // it will add subscriberCount,channelSubscribedToCount fields in user document 
            $addFields: {
                subscriberCount: {
                    $size: "$subcribers"
                },
                channelSubscribedToCount: {
                    $size: "$channel"
                },
                isUserSubcribed: {
                    // $cond takes 3 parameters 
                    // 1. if{} --> the condition
                    // 2. then -> if cond. true
                    // 3. else --> if cond. false

                    $cond: {
                        // condition is --> the documents which we got for channel having num of subs.. agr is document me user h as a subscriber then return true else false
                        if: {
                            // $in --> it cal. if val. present or not 
                            $in: [req.user?._id, "$subcribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },

        {   // it means projection --> mtlb user ko sirf slected fields hi return krna
            $project: {
                fullname: 1,
                username: 1,
                email: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isUserSubcribed: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ])

    console.log("channel: ",channel);
    console.log("channel[0]: ",channel[0]);

    if(!channel?.length){
        throw new ApiError(401, "didn't get channel")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "user channel get successful")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    accessTokenRefresh,
    updateUserCurrentPassoword,
    getCurrentUser,
    updateAccountDetails,
    updateCoverImage,
    updateUserAvatar,
    getUSerChannelProfile
    
}
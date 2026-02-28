import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import cookieParser from "cookie-parser"


export const jwtVerify = asyncHandler( async (req, res, next) => {
    // console.log(req);
    
    try {
        console.log("req.cookies?.accessToken ",req.cookies?.accessToken);
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("token",token);
        
        if(!token){
            throw new ApiError(401, "Unauthorized Access")
        }

        // console.log("process.env.ACCESS_TOKEN_SECRET",process.env.ACCESS_TOKEN_SECRET);
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user){
            throw new ApiError(401, "Invalid accesss token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error.message)   
    }

})  

import { Router } from "express";
import { registerUser, loginUser, logoutUser, accessTokenRefresh } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewalre.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),    
    registerUser // method
)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(jwtVerify, logoutUser)
router.route("/accesstokenrefresh").post(accessTokenRefresh)


export {router}
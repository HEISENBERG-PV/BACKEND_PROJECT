import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // for optimizing searching in database
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true // for optimizing searching in database
        },
        avatar: {
            type: String, // cloundinary url
            required: true,
        },
        coverImage:{
            type: String // cloundinary url
        },
        password: {
            type: String,
            required: true,
            unique: true
        },
        userWatchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)


// function to encrypte the password... we don't need to call function for encryption it will automatically encrypte password before saving 
userSchema.pre('save', async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
    else{
        return next()
    }
})



// creating custom method to check password


// it returns a boolean value
userSchema.methods.ispasswordCorrect = async function(password){
    // console.log("password",password); 
    
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
    {   // Payload / Data to be stored
        _id: this._id,
        email: this.email,
        username: this.username
    },
    // token secret
    process.env.ACCESS_TOKEN_SECRET,
    // token expiry
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )

}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
    { // PAYLOAD / DATA to be stored
        _id: this._id,
        email: this.email,
        username: this.username
    },
    // token secret
    process.env.REFRESH_TOKEN_SECRET,
    // token expiry
    {

        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )

}

export const User = mongoose.model("User", userSchema);
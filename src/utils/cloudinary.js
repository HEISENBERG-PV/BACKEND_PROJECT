import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDNIARY_API_NAME, 
    api_key: process.env.CLOUDNIARY_API_KEY, 
    api_secret: process.env.CLOUDNIARY_API_SECRET
});


// method to upload file in cloudinary
const cloudinary_fileUpload = async function(localFilePath){
    try {
        if(!localFilePath) return null;

        // method to upload the file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        fs.unlinkSync(localFilePath)
        // file uploaded
        console.log("file has been uploaded",response.url);
        console.log(response);
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // it remove the locally save temporary file if upload fails 
        console.log("Errror in cloudinary_fileUpload method", error);
        return null;
    }  
}

export {cloudinary_fileUpload}
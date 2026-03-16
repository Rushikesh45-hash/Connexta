import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

const uploadcloudinary = async(localpath)=>{
    try {
        if(!localpath) return;
        console.log("Middleware = ", localpath);
        //file uploaded on cloud with cloudinary localpath is path where we save this file temporarily which in our local memory
        const result=await cloudinary.uploader.upload(localpath,{resource_type:"auto"});
        console.log("Success upload",result.url);
        fs.unlinkSync(localpath);
        return result.secure_url;
    } catch (error) {
        console.log("Cloudinary error",error);  
        fs.unlinkSync(localpath);//this removes locallly saved file from our system
        return null;
    }
}

export {uploadcloudinary}
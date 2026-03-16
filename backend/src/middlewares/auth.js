import { asynchandler  } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import jwt from "jsonwebtoken"
import { user } from "../models/user.js";

export const verifyJWT = asynchandler(async (req,_,next)=>{
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        //this rq.header is optional if user does not have cookies like in mobile access
        if(!token){
            throw new Apierror(401,"You are not logged in, please login to access this resource")
        }
    
        const decodedvalue=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const userr=await user.findById(decodedvalue._id).select("-password -refreshToken")
        if(!userr){
            throw new Apierror(401,"The user belonging to this token does no longer exist")
        }
        req.user = userr
        next()
    } catch (error) {
        console.log(error)
        throw new Apierror(401,"Invalid token or Token has expired, please login again")
    }

})
import {asynchandler} from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import {user} from "../models/user.js";
import { calculateProfileCompletion } from "../utils/profilecompltion.js";
import {uploadcloudinary} from "../utils/cloudinary.js"
import{Apiresponse} from "../utils/response.js"
import jwt from "jsonwebtoken"


const generateaccessandrefreshtoken =async(userId)=>{
    try {
        const userr = await user.findById(userId)
        const  RefreshToken= userr.generaterefreshtoken()
        const AccessToken = userr.generateaccesstoken()
        console.log("Accesstoken =",AccessToken)
        console.log("Refreshtoken =",RefreshToken)
        userr.refreshToken = RefreshToken
        await userr.save({validateBeforeSave:false})
        return {AccessToken,RefreshToken}
        

    } catch (error) {
        console.log(error)
        throw new Apierror(500,"Error in token gggg generation")        
    }
}


const registeruser=asynchandler(async (req, res,next)=>{
    const {full_name,user_name,email,password} = req.body
       console.log("BODY ===>", req.body)
    // if(full_name === "" || user_name === "" || email === "" || age ==="" || password === "" || gender=== ""|| Hobbies=== ""|| location===""|| salary=== "" || mobile_No === "" || education === "" || bio === ""){
    //     throw new Apierror(400, "All fields are required")
    // }
    const requiredFields = [
        full_name,user_name,email,password
    ];
    if (requiredFields.some(field => field === undefined || String(field).trim() === "")) {
        throw new Apierror(400, "All fields are required");
    }

    const existeduser=await user.findOne({$or:[{user_name},{email}]})
    if(existeduser){throw new Apierror(409, "User_name or email already exist, please use different one or login ")}

//     const avatarlocalpath=req.file?.path;
//    // console.log(avatarlocalpath, typeof(avatarlocalpath))
//     if(!avatarlocalpath){
//         throw new Apierror(400,"Avatar is required")}

//     const avatarurl = await uploadcloudinary(avatarlocalpath);
//     if(!avatarurl){
//         throw new Apierror(400,"Error in avatar upload middleware")
//     }
    const userdata=await user.create({
        user_name,full_name,email,password,

        //  normal signup users are local users
        authProvider:"local"
    })

    const createduser=await user.findById(userdata._id).select(
        "-password -refreshToken"
    )//this is for cheking purpose if user is create in database or not
    //and this .select is method is used to remove this from database means we don't  need to save this in database

    const {AccessToken, RefreshToken}=await generateaccessandrefreshtoken(userdata._id)
    //here we just generate access and refresh token for user
    const userloggedin=await user.findById(userdata._id).select("-password -refreshToken")
    const option = {
        httpOnly:true,

        //  secure must be false for localhost, true only in production https
        secure:false
    }
    if(!createduser){throw new Apierror(500,"something went wrong")}

    const isProfileComplete = calculateProfileCompletion(userloggedin) === 75;

    return res.status(200)
    .cookie("refreshToken", RefreshToken, option)
    .cookie("accesstoken", AccessToken, option)
    .json(
        new Apiresponse(
            200,
            {
                user: userloggedin,
                AccessToken,
                RefreshToken,
                isProfileComplete
            },
            "User created successfully"
        )
    );
})

const profileuser=asynchandler(async (req,res)=>{
    const {age, gender, Hobbies, location, salary, mobileNo, education, bio} = req.body

    // required fields check
    const requiredFields = [
        age, gender, Hobbies, location, salary, mobileNo, education, bio
    ];

    if (requiredFields.some(field => field === undefined || String(field).trim() === "")) {
        throw new Apierror(400, "All fields are required");
    }

    //  Hobbies should be array always
    const hobbiesArray = Array.isArray(Hobbies) ? Hobbies : [Hobbies];

    const avatarlocalpath=req.file?.path;
   // console.log(avatarlocalpath, typeof(avatarlocalpath))
    if(!avatarlocalpath){
        throw new Apierror(400,"Avatar is required")
    }

    const avatarurl = await uploadcloudinary(avatarlocalpath);
    if(!avatarurl){
        throw new Apierror(400,"Error in avatar upload middleware")
    }

    console.log("avatarurl:", avatarurl);
    console.log("typeof avatarurl:", typeof avatarurl);

    const updateduser=await user.findByIdAndUpdate(
        req.user._id,
        { $set: {age, gender, Hobbies: hobbiesArray, location, salary, mobileNo, education, bio, avatar: avatarurl} },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    console.log(updateduser)

    const profileCompletion = calculateProfileCompletion(updateduser);
    console.log("Profile Completion:", profileCompletion);

    return res.status(200).json(
        new Apiresponse(
            200,
            {
                user: updateduser,
                profileCompletion
            },
            "User profile updated successfully"
        )
    );
});

const updateprofile=asynchandler(async (req,res)=>{
    //first we need to take the unique id from the req.user which is set by verifyJWT middleware
    //then we neew to create one object and write only updatable fields which can modify user at any time not all like user_name, email or password
    //after that we need to take data from req.body and simply run loop on that object which we created
    //and check if that field is present in req.body then only we will set that field in our object
    //after that we will call findByIdAndUpdate method of mongoose and pass that object

    const userrr=await user.findById(req.user._id)
    if(!userrr){
        throw new Apierror(404,"User not found")
    }
    const updatablefields = {};
    const fields = ["age", "gender", "Hobbies", "location", "salary", "mobile_No", "education", "bio"];
    fields.forEach((field)=>{
        if(req.body[field] !== undefined){
            updatablefields[field]=req.body[field];
        }
    });
    const updateduser=await user.findByIdAndUpdate(
        req.user._id,
        { $set: updatablefields },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");
    return res.status(200).json(
        new Apiresponse(200, updateduser, "User profile updated successfully")
    );
});

const loginuser =asynchandler(async (req,res)=>{
    //take data frpm req.body
    //take username and email and check
    //if wrong then.. and if correct then password
    //then again check password if correct 
    // then generate this refresh token and access token(This token we genrate for the first time only when user login) 
    // and after second time we genrate new access token using refresh token
    //send to user through cookies
    const {email,user_name,password}=req.body
    if(!user_name && !email){throw new Apierror(400,"One of username or email is required")}

    const usernamedata=await user.findOne({
        $or : [{user_name},{email}]
    })

    if(!usernamedata){throw new Apierror(404, "YOu have to register first sir")}
    //Here we check if username or email given by user is present or not and if nt means user never register before

    //  if user registered with google then block password login
    if(usernamedata.authProvider === "google"){
        throw new Apierror(400,"This account was registered using Google. Please login with Google")
    }

    const ispasswordcorrect = await usernamedata.ischeckpassword(password)
    if(!ispasswordcorrect){throw new Apierror(401,"Password is incorrect")}

    const {AccessToken, RefreshToken}=await generateaccessandrefreshtoken(usernamedata._id)
    //here we just generate access and refresh token for user
    const userloggedin=await user.findById(usernamedata._id).select("-password -refreshToken")
    const option = {
        httpOnly:true,

        //  secure must be false for localhost, true only in production https
        secure:false
    }

    const isProfileComplete = calculateProfileCompletion(userloggedin) === 100;

    return res
    .status(200)
    .cookie("refreshToken", RefreshToken, option)
    .cookie("accesstoken", AccessToken, option)
    .json(
        new Apiresponse(
            200,
            {
                user: userloggedin,
                AccessToken,
                RefreshToken,
                isProfileComplete
            },
            "User logged in successfully"
        )
    );//here we return or send the refresh and access token to user through cookies  

})

const logoutuser=asynchandler(async (req,res)=>{
        const dataa=await user.findByIdAndUpdate(
            req.user._id,{
                $set:{refreshToken:undefined}
            }
        )
         const option = {
        httpOnly:true,

        //  secure must be false for localhost, true only in production https
        secure:false}
            console.log("Logout succesful")
         return res
            .clearCookie("accesstoken", option)
            .clearCookie("refreshToken", option)
            .status(200)
            .json({
                success: true,
                message: "User logged out successfully",
                data: dataa
            });
        
})

const generatenewaccesstoken = asynchandler(async(req,res)=>{
        const incomingrefreshtoken= req.cookies.refreshToken || req.body.refreshToken
        if(!incomingrefreshtoken){
            throw new Apierror(401,"You are not logged in, please login to access this resource")
        }
        try {
            const decodedrefreshtoken=jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
            if(!decodedrefreshtoken){
                throw new Apierror(401,"Invalid refresh token or refreshtoken has expired, please login again")
            }
    
            const User=await user.findById(decodedrefreshtoken?._id)
            if(!User){
                throw new Apierror(401,"invalid refresh token")
            }
    
            if(User.refreshToken !== incomingrefreshtoken){
                throw new Apierror(401,"Token mismatch, please login again or Refreshtoken is expired")
            }
    
            const options={
                httpOnly:true,

                //  secure must be false for localhost
                secure:false
            }
    
            const {AccessToken,RefreshToken}= await generateaccessandrefreshtoken(User._id)
            return res
            .status(200)
            .cookie("accesstoken", AccessToken, options)
            .cookie("refreshToken", RefreshToken, options)
            .json(
                new Apiresponse(200,{AccessToken,RefreshToken},"New access token generated successfully")
            )
        } catch (error) {
            console.log(error)
            throw new Apierror(401,"Invalid refresh token or refreshtoken has expired, please login again")
        }
})


//this controller is used to check profile is complete or not
const getcurrentuser = asynchandler(async (req, res) => {
    const currentuser = await user.findById(req.user._id).select("-password -refreshToken");

    if (!currentuser) {
        throw new Apierror(404, "User not found");
    }

    const missingFields = [];

    if (currentuser.age === null || currentuser.age === undefined) missingFields.push("age");
    if (!currentuser.gender?.trim()) missingFields.push("gender");
    if (!currentuser.location?.trim()) missingFields.push("location");
    if (currentuser.salary === null || currentuser.salary === undefined) missingFields.push("salary");
    if (!currentuser.mobileNo?.trim()) missingFields.push("mobileNo");
    if (!currentuser.education?.trim()) missingFields.push("education");
    if (!currentuser.bio?.trim()) missingFields.push("bio");
    if (!currentuser.avatar?.trim()) missingFields.push("avatar");
    if (!Array.isArray(currentuser.Hobbies) || currentuser.Hobbies.length === 0) missingFields.push("Hobbies");

    const isProfileComplete = missingFields.length === 0;

    return res.status(200).json(
        new Apiresponse(
            200,
            {
                user: currentuser,
                isProfileComplete,
                missingFields
            },
            "Current user fetched successfully"
        )
    );
});

export const getcurrentuserbyid = asynchandler(async (req, res) => {
  const profile = await user.findById(req.params.id).select("-password -refreshToken");

  if (!profile) {
    throw new Apierror(404, "User not found");
  }

  return res.status(200).json(new Apiresponse(200, profile, "User profile fetched"));
});

export {registeruser,loginuser,logoutuser,generatenewaccesstoken, profileuser, updateprofile, getcurrentuser};
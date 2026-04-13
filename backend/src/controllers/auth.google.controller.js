import jwt from "jsonwebtoken";
import { asynchandler } from "../utils/asynchandler.js";
import { Apiresponse } from "../utils/response.js";
import { user as UserModel } from "../models/user.js";

export const googleCallback = asynchandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(400).json(
      new Apiresponse(400, {}, "User not found from Google")
    );
  }

  //generate access token
  //means here we are generating jwt access token using user id
  const accesstoken = jwt.sign(
    { _id: user._id }, //  your verifyJWT expects decodedvalue._id
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  //generate refresh token
  //means here we are generating refresh token using user id
  const refreshtoken = jwt.sign(
    { _id: user._id }, //  your verifyJWT expects decodedvalue._id
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  console.log("Generated Access Token:", accesstoken);
  console.log("Generated Refresh Token:", refreshtoken);

  //store refresh token in database
  //means here we are saving refresh token in database for that user
  await UserModel.findByIdAndUpdate(user._id, {
    $set: { refreshToken: refreshtoken }
  });

  const options = {
    httpOnly: true,
    secure: false, // true only in production https
    sameSite: "lax",
    path: "/"
  };

  //set cookies and redirect to frontend dashboard
  //means here we are setting cookies in browser and redirecting user to frontend dashboard
  // cookie name must be "accesstoken" because your verifyJWT checks req.cookies.accesstoken
  return res
    .cookie("accesstoken", accesstoken, options) // FIXED
    .cookie("refreshToken", refreshtoken, options)
    .redirect("http://localhost:3000/dashboard");
});
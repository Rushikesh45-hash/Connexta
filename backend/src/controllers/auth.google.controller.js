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
  const accesstoken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  //generate refresh token
  const refreshtoken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  //store refresh token in database
  await UserModel.findByIdAndUpdate(user._id, {
    $set: { refreshToken: refreshtoken }
  });

  const options = {
    httpOnly: true,
    secure: false // true only in production https
  };

  //set cookies and redirect to frontend dashboard
  return res
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .redirect("http://localhost:3000/dashboard");
});
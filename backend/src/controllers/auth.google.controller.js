import jwt from "jsonwebtoken";
import { asynchandler } from "../utils/asynchandler.js";
import { Apiresponse } from "../utils/response.js";

export const googleCallback = asynchandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(400).json(
      new Apiresponse(400, {}, "User not found from Google")
    );
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json(
    new Apiresponse(
      200,
      {
        token,
        user,
      },
      "Google login successful"
    )
  );
});
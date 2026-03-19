import express from "express";
import passport from "passport";
import { googleCallback } from "../controllers/auth.google.controller.js";

const router = express.Router();

// Step 1
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], 
  })
);

// Step 2
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login", // Redirect to login page on failure
  }),
  googleCallback
);

export default router;

//http://localhost:8000/auth/google this link is used for google authentication and after successful authentication it will redirect to http://localhost:8000/auth/google/callback and then we will get the token in response and we can use that token for further authentication in our app
//means whenever user click on login with google button then it will redirect to google authentication page and after successful authentication it will redirect to our callback url and we have profile and email of that user and 
//simply we check that email is already exist in our database or not if exist then we will generate token for that user and send it to client and if not exist then we will create new user in our database and then generate token for that user and send it to client.
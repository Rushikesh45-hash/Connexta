import express from "express";
import passport from "passport";
import { googleCallback } from "../controllers/auth.google.controller.js";

const router = express.Router();

// Step 1
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // ✅ correct
  })
);

// Step 2
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login", // ✅ added (important for debugging)
  }),
  googleCallback
);

export default router;

//http://localhost:8000/auth/google this link is used for google authentication and after successful authentication it will redirect to http://localhost:8000/auth/google/callback and then we will get the token in response and we can use that token for further authentication in our app
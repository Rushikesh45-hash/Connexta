import passport from "passport";
import pkg from "passport-google-oauth20";
import { user } from "../models/user.js";

const { Strategy: GoogleStrategy } = pkg;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback", // ✅ must match console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ✅ SAFETY: profile.emails may be undefined
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Email not received from Google"), null);
        }

        const name = profile.displayName;

        let userr = await user.findOne({ email });

        if (!userr) {
          userr = await user.create({
            email,
            name,
            googleId: profile.id,
          });
        }

        return done(null, userr);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
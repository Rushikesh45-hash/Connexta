import passport from "passport";
import pkg from "passport-google-oauth20";
import { user } from "../models/user.js";

const { Strategy: GoogleStrategy } = pkg;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback", //  must match console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
     
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Email not received from Google"), null);
        }

        const name = profile.displayName;

        let userr = await user.findOne({ email });

        if (!userr) {

          // username auto generate because google doesn't provide username
          const baseUsername = email.split("@")[0].toLowerCase();
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const generatedUsername = `${baseUsername}${randomNum}`;

          userr = await user.create({
            email,
            full_name: name, //  your schema expects full_name not name
            user_name: generatedUsername, // required field
            googleId: profile.id, //  store google id
            authProvider: "google", //  mark as google user
            verified: true, //optional since google already verifies email, you can trust it, so mark as verified
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
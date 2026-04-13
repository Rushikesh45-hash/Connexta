import passport from "passport";
import pkg from "passport-google-oauth20";
import { user } from "../models/user.js";

const { Strategy: GoogleStrategy } = pkg;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, //google client id from google cloud console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, //google secret key from google cloud console
      callbackURL: "http://localhost:8000/auth/google/callback", //  must match console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        //here we get the email from google profile and if email is not present then we will return error
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Email not received from Google"), null);
        }

        //here we get the name from google profile
        const name = profile.displayName;

        //here we check that user is already exist in our database or not using email
        let userr = await user.findOne({ email });

        if (!userr) {

          // username auto generate because google doesn't provide username
          const baseUsername = email.split("@")[0].toLowerCase();
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const generatedUsername = `${baseUsername}${randomNum}`;

          //here we create new user in database if not exist
          userr = await user.create({
            email,
            full_name: name, //  your schema expects full_name not name
            user_name: generatedUsername, // required field
            googleId: profile.id, //  store google id
            authProvider: "google", //  mark as google user
            verified: true, //optional since google already verifies email, you can trust it, so mark as verified
          });
        }

        //here we return user object and passport will store it in req.user
        return done(null, userr);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
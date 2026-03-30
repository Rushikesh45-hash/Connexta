import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    full_name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },

    // password is required only if user register using normal signup
    password: { 
        type: String, 
        required: function () {
            return this.authProvider === "local";
        }
    },

    // this will tell user register with normal signup or google signup
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },

    // store google id if user registered with google
    googleId: {
        type: String,
        default: null
    },

    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    Hobbies: [String],
    location: String,
    salary: Number,
    mobileNo: String,
    education: String,
    bio: String,
    avatar: String,

    // our refreshToken should be string not array
    refreshToken: { type: String },

    verified: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now }
}, { timestamps: true });


// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     // next()
// });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;   // do nothing if password not modified
    this.password =  await bcrypt.hash(this.password, 10);  // hash the password
});

//custom methods this is nothing but simple function which is created by coder on schema
userSchema.methods.ischeckpassword = async function(password){
    // if password is not present (google user) then return false
    if(!this.password) return false;
    return await bcrypt.compare(password,  this.password);
}

userSchema.methods.generateaccesstoken = function(){
    return jwt.sign({
        _id:this._id,
        name:this.user_name
    },process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generaterefreshtoken = function(){
     return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}


export const user = mongoose.model("User",userSchema)
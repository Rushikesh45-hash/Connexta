import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
import {DB_NAME} from "../constants.js"

const connectdb = async () =>{
    try {
        const connectiondata=await mongoose.connect(`${process.env.Mongodb_Url}`)
        console.log(`Connection success `);
    } catch (error) {
        console.error("MongoDB Error", error);
        process.exit(1);
    }
}

export default connectdb;
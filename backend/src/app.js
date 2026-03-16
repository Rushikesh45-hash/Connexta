import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"60kb"})) //we take data in json format also we just to explain or telling the express like hey we can take data in json format also
app.use(express.urlencoded({extended:true, limit:"20kb"})) //here same again we can acept data in url also and again we use extended means many time url is encoded so for that we use that
app.use(express.static("public"))

app.use(cookieParser())//cookieparser is used for just access the user's browser cookie data

//routes import
import UserRouter from "./routes/user.routes.js"
app.use("/users",UserRouter)

app.use("/connections",UserRouter)

export {app}
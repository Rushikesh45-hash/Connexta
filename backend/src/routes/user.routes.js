import {Router} from "express";
import { loginuser, registeruser,logoutuser,generatenewaccesstoken, profileuser, updateprofile,getcurrentuser, getcurrentuserbyid } from "../controllers/user.controllers.js";
import { sendConnectionRequest, givependingrequest, reviewConnectionRequest, discoverusers, blockuser, unblockuser, matchingalgorithm, myconnections} from "../controllers/connections.controllers.js";  
import { sendmessage, getmessages, markasread, createchatroom } from "../controllers/chat.controller.js";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();
router.route("/register").post(registeruser);//for registering the user and creating the user in database

router.route("/login").post(loginuser);//for login the user and giving the jwt token to the user for authentication and authorization

router.route("/logout").post(verifyJWT,logoutuser);  //for logout the user and clearing the cookie from the browser and also we can blacklist the token in future if we want to implement that

router.route("/newaccesstoken").post(generatenewaccesstoken);//for genrating new access toekn with help of refresh token as we get from cookies or header baarrier token

router.route("/updateprofile").put(verifyJWT,updateprofile)//for updating the user profile without avatar update

router.route("/connect/:userId").post(verifyJWT,sendConnectionRequest)//which is for sending connection request to other user

router.patch("/review/:connectionId",verifyJWT,reviewConnectionRequest);//for accepting or rejecting the connection request which we receive from other user

router.route("/pending").get(verifyJWT,givependingrequest);//give all pending requests

router.route("/profile").put(verifyJWT,upload.single("avatar"),profileuser);//creating profile with avatar upload

router.route("/user/:id").get(verifyJWT, getcurrentuserbyid);//for getting our profile to show in profile view page

router.route("/checkprofilecomplete").get(verifyJWT, getcurrentuser);//

router.route("/discover").get(verifyJWT, discoverusers);//to discover all otehr users for matching and sending connection request

router.route("/myconnections").get(verifyJWT, myconnections); //for showing all accepted connections

router.route("/block/:blockedUserId").post(verifyJWT, blockuser);//for blocking the other user which in we don't interest to connect

router.route("/unblock/:blockedUserId").post(verifyJWT, unblockuser);//for unblock that user which we bloacked

router.route("/matching").get(verifyJWT, matchingalgorithm);//for discover matching algorithm and give best matching alog with matching score

router.route("/sendmessage/:receiver_id").post(verifyJWT,sendmessage);//for send message to other user and we create chatroom

router.route("/getmessages/:receiver_id").get(verifyJWT,getmessages);//get all message of that chatroom between two user and also we can give that chatroom id in future if we want to implement group chat also

router.route("/toseen/:chatroom_id").post(verifyJWT,markasread);//for marking the message as read

router.route("/createchatroom/:receiver_id").post(verifyJWT, createchatroom);//for creating chatroom if not exist

export default router;
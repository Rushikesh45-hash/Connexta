import {Router} from "express";
import { loginuser, registeruser,logoutuser,generatenewaccesstoken, profileuser, updateprofile,getcurrentuser, getcurrentuserbyid } from "../controllers/user.controllers.js";
import { sendConnectionRequest, givependingrequest, reviewConnectionRequest, discoverusers, blockuser, unblockuser, matchingalgorithm} from "../controllers/connections.controllers.js";  
import { sendmessage, getmessages, markasread } from "../controllers/chat.controller.js";
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();
router.route("/register").post(registeruser);

router.route("/login").post(loginuser);

router.route("/logout").post(verifyJWT,logoutuser);

router.route("/newaccesstoken").post(generatenewaccesstoken);

router.route("/updateprofile").put(verifyJWT,updateprofile)

router.route("/connect/:userId").post(verifyJWT,sendConnectionRequest)

router.patch("/review/:connectionId",verifyJWT,reviewConnectionRequest);

router.route("/pending").get(verifyJWT,givependingrequest);

router.route("/profile").put(verifyJWT,upload.single("avatar"),profileuser);//creating profile with avatar upload

router.route("/user/:id").get(verifyJWT, getcurrentuserbyid);//for getting our profile to show in profile view page

router.route("/checkprofilecomplete").get(verifyJWT, getcurrentuser);

router.route("/discover").get(verifyJWT, discoverusers);

router.route("/block/:blockedUserId").post(verifyJWT, blockuser);

router.route("/unblock/:blockedUserId").post(verifyJWT, unblockuser);

router.route("/matching").get(verifyJWT, matchingalgorithm);

router.route("/sendmessage/:receiver_id").post(verifyJWT,sendmessage);

router.route("/getmessages/:receiver_id").get(verifyJWT,getmessages);

router.route("/toseen/:chatroom_id").post(verifyJWT,markasread);

export default router;
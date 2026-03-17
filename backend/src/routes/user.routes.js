import {Router} from "express";
import { loginuser, registeruser,logoutuser,generatenewaccesstoken, profileuser, updateprofile } from "../controllers/user.controllers.js";
import { sendConnectionRequest, givependingrequest, reviewConnectionRequest, discoverusers, blockuser, unblockuser, matchingalgorithm} from "../controllers/connections.controllers.js";  
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

router.route("/profile").put(verifyJWT,upload.single("avatar"),profileuser);

router.route("/discover").get(verifyJWT, discoverusers);

router.route("/block/:blockedUserId").post(verifyJWT, blockuser);

router.route("/unblock/:blockedUserId").post(verifyJWT, unblockuser);

router.route("/matching").get(verifyJWT, matchingalgorithm);

export default router;
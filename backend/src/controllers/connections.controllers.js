import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/response.js";
import { Connection } from "../models/modelconnetion.js";
import { Block } from "../models/bloke.model.js";
import { user } from "../models/user.js";

export const sendConnectionRequest = asynchandler(async (req, res) => {
    const senderId = req.user._id;
    const recipientId = req.params.userId;
    if (senderId.toString() === recipientId) {
        throw new Apierror(400, "You cannot send request to yourself");
    }
    const recipientUser = await user.findById(recipientId);
    if (!recipientUser) {
        throw new Apierror(404, "Recipient user not found");
    }
    const existingConnection = await Connection.findOne({
        $or: [
            { requester: senderId, recipient: recipientId },
            { requester: recipientId, recipient: senderId }
        ]
    });

    if (existingConnection) {
        if (existingConnection.status === "pending") {
            throw new Apierror(400, "Connection request is pending");
        }
        if (existingConnection.status === "accepted") {
            throw new Apierror(400, "You are already connected");
        }
        if (existingConnection.status === "rejected") {
            throw new Apierror(400, "Request already rejected");
        }
    }

    const connection = await Connection.create({
        requester: senderId,
        recipient: recipientId
    });

    return res.status(201).json(
        new Apiresponse(201, connection, "Connection request sent successfully")
    );
});

export const givependingrequest = asynchandler(async (req, res) => {
    const currentuser = req.user._id;
    //we need to call connections model with $And operator not $or because we want recipient to be current user and status to be pending
    const pendingrequest = await Connection.find({
        $and: [
            { recipient: currentuser },
            { status: "pending" }
        ]
    }).populate("requester", "-password -refreshToken"); //we are populating requester field with user model but excluding password and refresh token fields

    if(!pendingrequest.length){
        return res.status(200).json(new Apiresponse(200, [], "No pending requests found"));
    }
    return res.status(200).json(new Apiresponse(200, pendingrequest, "Pending requests retrieved successfully"));
});

export const reviewConnectionRequest = asynchandler(async (req, res) => {
    const connectionId = req.params.connectionId;
    const { status } = req.body; 
    const currentUserId = req.user._id;
    if (!["accepted", "rejected"].includes(status)) {
        throw new Apierror(400, "Invalid status value");
    }
    const connection = await Connection.findById(connectionId);
    if (!connection) {
        throw new Apierror(404, "Connection not found");
    }
    if (connection.recipient.toString() !== currentUserId.toString()) {
        throw new Apierror(403, "You are not authorized to review this request");
    }
    if (connection.status !== "pending") {
        throw new Apierror(400, `Request already ${connection.status}`);
    }
    connection.status = status;
    await connection.save();
    return res.status(200).json(
        new Apiresponse(200, connection, `Connection ${status}`)
    );
});
//if request is penf=ding then through this we can accept ot reject the request this is route do

export const discoverusers = asynchandler(async (req, res) => {
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const connections = await Connection.find({
        $or: [
            { requester: currentUserId },
            { recipient: currentUserId }
        ]
    });
    const excludedUsers = new Set();

    connections.forEach(conn => {
        const otherUser =
            conn.requester.toString() === currentUserId.toString()
                ? conn.recipient
                : conn.requester;
        excludedUsers.add(otherUser.toString());
    });
    excludedUsers.add(currentUserId.toString());

    const users = await user.find({
        _id: { $nin: Array.from(excludedUsers) }
    })
    .select("full_name age avatar location bio")
    .limit(limit)
    .skip(skip);
    return res.status(200).json(
        new Apiresponse(
            200,
            {
                page,
                limit,
                count: users.length,
                users
            },
            "Discover users retrieved successfully"
        )
    );
});



export const blockuser = asynchandler(async (req, res) => {
    const currentUser = req.user._id; 
    const { blockedUserId } = req.params;
    const alreadyBlocked = await Block.findOne({ blockerId: currentUser, blockedId: blockedUserId });
    if (alreadyBlocked) {
        return res.status(400).json(new Apiresponse(400, null, "User already blocked"));
    }
    const block = new Block({
        blockerId: currentUser,
        blockedId: blockedUserId
    });
    await block.save();
    return res.status(201).json(new Apiresponse(201, block, "User blocked successfully"));
});



export const unblockuser = asynchandler(async (req, res) => {
    const currentUser = req.user._id;
    const { blockedUserId } = req.params;
    const block = await Block.findOne({ blockerId: currentUser, blockedId: blockedUserId });
    if (!block) {
        return res.status(400).json(new Apiresponse(400, null, "Block not found"));
    }
    await Block.deleteOne({ _id: block._id });
    return res.status(200).json(new Apiresponse(200, null, "User unblocked successfully"));
});
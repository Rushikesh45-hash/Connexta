import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import { Apiresponse } from "../utils/response.js";
import { Connection } from "../models/modelconnetion.js";
import { Block } from "../models/block.model.js";
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


const unwantedwords = ["the", "is", "in", "and", "or", "of", "to", "a", "with", "for", "on", "by", "as", "at", "from"];
const maxdiff = {
    age: 5,
    salary: 40000
}
 const weight={
    age : 10,
    salary : 20,
    location :10,
    Hobbies : 25,
    bio : 20,
    interactionbonus : 5
 }

 function getmeaningkeywords(bio){
    return bio
    ?.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(word => !unwantedwords.includes(word)) || [];
 }


 function calculatematchscore(currentuser, otheruser){
    let score = 0;
    const reasons = [];

    const agediff = Math.abs(currentuser.age - otheruser.age);
    const agescore = Math.max(0, maxdiff.age - agediff) / maxdiff.age * weight.age;
    if (agescore > 0) {
        score += agescore;
        reasons.push(`Age difference is just ${agediff} years so you can connect to each other`);
    }

    const salarydiff = Math.abs(currentuser.salary - otheruser.salary);
    const salaryscore = Math.max(0, maxdiff.salary - salarydiff) / maxdiff.salary * weight.salary;
    if (salaryscore > 0) {
        score += salaryscore;
        reasons.push(`Salary difference is ${salarydiff}, but actually salary is just a number and it doesn't define you as a person so you can connect to each other, this is my personal opinion`);
    }

    const cityscore = currentuser.location === otheruser.location ? weight.location : 0;
    if (cityscore > 0) {
        score += cityscore;
        reasons.push(`You both live in the same city ${currentuser.location} so you can connect to each other`);

    }

    const commonhobbies = currentuser.Hobbies.filter(hobby => otheruser.Hobbies.includes(hobby));
    const hobbiescore = (commonhobbies.length / (currentuser.Hobbies.length)) * weight.Hobbies;
    if (hobbiescore > 0) {
        score += hobbiescore;
        reasons.push(`You both have ${commonhobbies.length} common hobbies so it will easy to connect to each other and have fun together`);
    }

    const currentuserkeywords = getmeaningkeywords(currentuser.bio);
    const otheruserkeywords = getmeaningkeywords(otheruser.bio);
    const commonkeywords = currentuserkeywords.filter(keyword => otheruserkeywords.includes(keyword));
    const bioscore = (commonkeywords.length / (currentuserkeywords.length || 1)) * weight.bio;  
    if (bioscore > 0) {
        score += bioscore;
        reasons.push(`You both have ${commonkeywords.length} common keywords in your bio so you can connect to each other`);
    }

    if (cityscore > 0 && hobbiescore >= (weight.Hobbies / 2)){
        score+=weight.interactionbonus;
    }
    if(agescore >= (weight.age / 2) && salaryscore >= (weight.salary / 2)){
        score+=weight.interactionbonus;
    }

    score = Math.min(100, score);

    return {score, reasons};

 }

 export const matchingalgorithm = asynchandler(async(req,res)=>{
    const currentuserid = req.user._id;

    // pagination added
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blockedusers = await Block.find({
        $or: [
            { blockerId: currentuserid },
            { blockedId: currentuserid }
        ]
    }).select("blockedId blockerId -_id");

    const allblockuserids = blockedusers.map(m =>{
        return m.blockerId.toString() === currentuserid.toString() ? m.blockedId.toString() : m.blockerId.toString();
    })

    const connections = await Connection.find({
    $or: [
      { requester: currentuserid._id },
      { recipient: currentuserid._id }
    ]
    }).select("requester recipient status");

    const connectedOrpendingids = connections.map(c =>
        c.requester.toString() === currentuserid._id.toString() ? c.recipient.toString() : c.requester.toString()
    );

    const candidates = await user.find({
        _id: { $nin: [...allblockuserids, ...connectedOrpendingids, currentuserid._id] }
    });

    const threshold = 78;
    const matches = candidates.map(candidate => {
        const { score, reasons } = calculatematchscore(req.user, candidate);
        return { user: candidate, score, reasons };
    }).filter(match => match.score >= threshold)
    .sort((a, b) => b.score - a.score);

    // pagination applied
    const paginatedMatches = matches.slice(skip, skip + limit);

    const response = paginatedMatches.map(m => ({
        _id: m.user._id,
        user_name: m.user.user_name,
        full_name: m.user.full_name,
        age: m.user.age,
        location: m.user.location,
        Hobbies: m.user.Hobbies,
        bio: m.user.bio,
        avatar: m.user.avatar,
        matchScore: m.score,
        matchReasons: m.reasons
    }));

    if(matches.length === 0){
        return res.status(200).json(new Apiresponse(200, [], "No matches found based on the criteria"));
    }

    return res.status(200).json(new Apiresponse(200, {
        matches: response,
        totalMatches: matches.length,
        currentPage: page,
        totalPages: Math.ceil(matches.length / limit)
    }, "Match scores calculated successfully"));


 })
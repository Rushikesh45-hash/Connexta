import asynchandler from "express-async-handler";
import { Apiresponse } from "../utils/apiresponse.js";
import Chatroom from "../models/chatroom.model.js";
import { Message } from "../models/message.model.js";


export const sendmessage = asynchandler(async (req, res) => {
    const sender_id = req.user._id;
    const { receiver_id } = req.params;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json(new Apiresponse(400, null, "message is required"));
    }
    if (sender_id.toString() === receiver_id) {
        return res.status(400).json(new Apiresponse(400, null, "cannot send message to yourself"));
    }

    let room = await Chatroom.findOne({
        participants: { $all: [sender_id, receiver_id] }
    });

    if (!room) {
        room = await Chatroom.create({
            participants: [sender_id, receiver_id]
        });
    }
    const newmessage = await Message.create({
        chatroom_id: room._id,
        sender_id,
        receiver_id,
        message
    });
    return res.status(201).json(
        new Apiresponse(201, newmessage, "message sent successfully")
    );
});


export const getmessages = asynchandler(async (req, res) => {
    const current_user = req.user._id;
    const { receiver_id } = req.params;
    const room = await Chatroom.findOne({
        participants: { $all: [current_user, receiver_id] }
    });
    if (!room) {
        return res.status(200).json(
            new Apiresponse(200, [], "no messages found")
        );
    }
    const messages = await Message.find({
        chatroom_id: room._id
    })
    .sort({ created_at: 1, _id: 1 })
    .select("sender_id message created_at");
    return res.status(200).json(
        new Apiresponse(200, messages, "messages fetched successfully")
    );
});

export const markasread = asynchandler(async (req, res) => {
    const user_id = req.user._id;
    const { chatroom_id } = req.params;
    await Message.updateMany(
        {
            chatroom_id,
            receiver_id: user_id,
            read: false
        },
        {
            $set: { read: true }
        }
    );
    return res.status(200).json(
        new Apiresponse(200, null, "messages marked as read")
    );
});
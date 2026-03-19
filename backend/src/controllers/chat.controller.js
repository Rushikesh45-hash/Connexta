import { asynchandler } from "../utils/asynchandler.js";
import { Apiresponse } from "../utils/response.js";
import Chatroom from "../models/chatroom.model.js";
import { Message } from "../models/message.model.js";
import { Connection } from "../models/modelconnetion.js";
import { getIO } from "../socket/socket.js";

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

  if (message.length > 1000) {
    return res.status(400).json(new Apiresponse(400, null, "message too long"));
  }

  const connectionpresent = await Connection.findOne({
    $or: [
      { requester: sender_id, recipient: receiver_id, status: "accepted" },
      { recipient: sender_id, requester: receiver_id, status: "accepted" }
    ]
  });

  if (!connectionpresent) {
    return res.status(400).json(
      new Apiresponse(400, null, "You are not connected")
    );
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

//socket integration
  const io = getIO();

  io.to(room._id.toString()).emit("receive_message", {
    chatroom_id: room._id,
    sender_id,
    message,
    created_at: newmessage.created_at
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
    .select("sender_id message created_at read");
    return res.status(200).json(
        new Apiresponse(200, messages, "messages fetched successfully")
    );
});



export const markasread = asynchandler(async (req, res) => {
    const user_id = req.user._id;
    const { chatroom_id } = req.params;
    const result = await Message.updateMany(
        {
            chatroom_id,
            receiver_id: user_id,
            read: false
        },
        {
            $set: { read: true }
        }
    );

    // Notify via socket
    const io = getIO();
    io.to(chatroom_id.toString()).emit("messages_read", {
        chatroom_id,
        reader_id: user_id
    });
    return res.status(200).json(
        new Apiresponse(200, result, "messages marked as read")
    );
});
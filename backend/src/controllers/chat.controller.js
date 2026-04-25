import { asynchandler } from "../utils/asynchandler.js";
import { Apiresponse } from "../utils/response.js";
import Chatroom from "../models/chatroom.model.js";
import { Message } from "../models/message.model.js";
import { Connection } from "../models/modelconnetion.js";
import { getIO } from "../socket/socket.js";
import { getCachedMessages, cacheMessage } from "../utils/chatcache.js";

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

  const connectionpresent = await Connection.findOne({
    $or: [
      { requester: sender_id, recipient: receiver_id, status: "accepted" },
      { recipient: sender_id, requester: receiver_id, status: "accepted" }
    ]
  });

  if (!connectionpresent) {
    return res.status(400).json(new Apiresponse(400, null, "You are not connected"));
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

  // cache message in redis (last 50)
  await cacheMessage(room._id.toString(), {
    _id: newmessage._id,
    sender_id: newmessage.sender_id,
    receiver_id: newmessage.receiver_id,
    message: newmessage.message,
    createdAt: newmessage.createdAt,
    read: newmessage.read
  });

  // socket emit
  const io = getIO();
  io.to(room._id.toString()).emit("receive_message", {
    chatroom_id: room._id,
    _id: newmessage._id,
    sender_id: newmessage.sender_id,
    receiver_id: newmessage.receiver_id,
    message: newmessage.message,
    createdAt: newmessage.createdAt,
    read: newmessage.read
  });

  return res.status(201).json(
    new Apiresponse(201, newmessage, "message sent successfully")
  );
});

export const getmessages = asynchandler(async (req, res) => {
  const current_user = req.user._id;
  const { receiver_id } = req.params;
  const { cursor } = req.query;

  const room = await Chatroom.findOne({
    participants: { $all: [current_user, receiver_id] }
  });

  if (!room) {
    return res.status(200).json(
      new Apiresponse(200, { messages: [], nextCursor: null, hasMore: false }, "no messages found")
    );
  }

  const chatroomId = room._id.toString();

  // FIRST LOAD (NO CURSOR)
  if (!cursor) {
    const cached = await getCachedMessages(chatroomId);

    if (cached.length > 0) {
      const oldestMessageTime = cached[0]?.createdAt;

      const olderExists = oldestMessageTime
        ? await Message.exists({
            chatroom_id: room._id,
            createdAt: { $lt: new Date(oldestMessageTime) }
          })
        : false;

      return res.status(200).json(
        new Apiresponse(
          200,
          {
            messages: cached,
            nextCursor: oldestMessageTime,
            hasMore: !!olderExists
          },
          "messages from redis"
        )
      );
    }

    // Redis empty → DB fetch once
    const messages = await Message.find({ chatroom_id: room._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("_id sender_id receiver_id message createdAt read");

    // cache them
    for (let msg of messages) {
      await cacheMessage(chatroomId, msg);
    }

    const reversed = messages.reverse();
    const oldest = reversed.length ? reversed[0].createdAt : null;

    const olderExists = oldest
      ? await Message.exists({
          chatroom_id: room._id,
          createdAt: { $lt: new Date(oldest) }
        })
      : false;

    return res.status(200).json(
      new Apiresponse(
        200,
        {
          messages: reversed,
          nextCursor: oldest,
          hasMore: !!olderExists
        },
        "messages from db"
      )
    );
  }

  // PAGINATION (CURSOR EXISTS)
  const messages = await Message.find({
    chatroom_id: room._id,
    createdAt: { $lt: new Date(cursor) }
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("_id sender_id receiver_id message createdAt read");

  const reversed = messages.reverse();
  const oldest = reversed.length ? reversed[0].createdAt : null;

  const olderExists = oldest
    ? await Message.exists({
        chatroom_id: room._id,
        createdAt: { $lt: new Date(oldest) }
      })
    : false;

  return res.status(200).json(
    new Apiresponse(
      200,
      {
        messages: reversed,
        nextCursor: oldest,
        hasMore: !!olderExists
      },
      "older messages from db"
    )
  );
});

export const markasread = asynchandler(async (req, res) => {
  const user_id = req.user._id;
  const { chatroom_id } = req.params;

  const result = await Message.updateMany(
    { chatroom_id, receiver_id: user_id, read: false },
    { $set: { read: true } }
  );

  // ❌ DO NOT DELETE REDIS CACHE HERE

  const io = getIO();
  io.to(chatroom_id.toString()).emit("messages_read", {
    chatroom_id,
    reader_id: user_id
  });

  return res.status(200).json(
    new Apiresponse(200, result, "messages marked as read")
  );
});

export const createchatroom = asynchandler(async (req, res) => {
  const sender_id = req.user._id;
  const { receiver_id } = req.params;

  const connectionpresent = await Connection.findOne({
    $or: [
      { requester: sender_id, recipient: receiver_id, status: "accepted" },
      { recipient: sender_id, requester: receiver_id, status: "accepted" }
    ]
  });

  if (!connectionpresent) {
    return res.status(400).json(new Apiresponse(400, null, "You are not connected"));
  }

  let room = await Chatroom.findOne({
    participants: { $all: [sender_id, receiver_id] }
  });

  if (!room) {
    room = await Chatroom.create({
      participants: [sender_id, receiver_id]
    });
  }

  return res.status(200).json(
    new Apiresponse(200, { chatroom_id: room._id }, "chatroom created successfully")
  );
});
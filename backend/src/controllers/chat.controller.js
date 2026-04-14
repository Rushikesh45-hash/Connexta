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

  // here we add redis cache for messages and we are caching only last 50 messages for each chatroom and
  // we are also setting an expiry time of 10 minutes for each chatroom messages in redis so that if there is no activity in that chatroom for 10 minutes then those messages will be removed from redis cache and
  // also when we send a new message to that chatroom then we will update the cache with that new message and also reset the expiry time for that chatroom messages in redis so that those messages will be available in cache for next 10 minutes from the time of last message sent in that chatroom and
  // also when we fetch messages for that chatroom then we will first check in redis cache if messages are present in cache then we will return those messages otherwise we will fetch from mongodb and also cache those messages in redis for future use

  await cacheMessage(room._id.toString(), {
    _id: newmessage._id,
    sender_id: newmessage.sender_id,
    message: newmessage.message,
    createdAt: newmessage.createdAt,
    read: newmessage.read
  });

  // socket
  const io = getIO();
  io.to(room._id.toString()).emit("receive_message", {
    chatroom_id: room._id,
    _id: newmessage._id,
    sender_id: newmessage.sender_id,
    message: newmessage.message,
    createdAt: newmessage.createdAt
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
  console.log("Chatroom found:", room);

  if (!room) {
    return res.status(200).json(
      new Apiresponse(200, { messages: [], nextCursor: null, hasMore: false }, "no messages found")
    );
  }

  const chatroomId = room._id.toString();

  // If cursor is not present means first time user is opening chat, so first check redis
  if (!cursor) {
    const cached = await getCachedMessages(chatroomId);

    if (cached.length > 0) {
      // cursor should always be the oldest message time currently loaded
      const oldestMessageTime = cached[0]?.createdAt || null;

      // check if older messages exist in DB
      const olderExists = await Message.exists({
        chatroom_id: room._id,
        createdAt: { $lt: new Date(oldestMessageTime) }
      });

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
  }

  const query = { chatroom_id: room._id };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .select("_id sender_id message createdAt read");

  // only cache messages if this is first page load (no cursor)
  if (!cursor && messages.length > 0) {
    await Promise.all(messages.map((msg) => cacheMessage(chatroomId, msg)));
  }

  // reverse because we fetched DESC order but UI needs ASC order
  const reversedMessages = messages.reverse();

  // cursor should be oldest message time
  const oldest = reversedMessages.length ? reversedMessages[0].createdAt : null;

  // check if older messages exist in DB
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
        messages: reversedMessages,
        nextCursor: oldest,
        hasMore: !!olderExists
      },
      "messages from db"
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

  const redis = (await import("../config/redis.js")).default;
  await redis.del(`chat:${chatroom_id}`);

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

  // here we are checking connection exists or not
  const connectionpresent = await Connection.findOne({
    $or: [
      { requester: sender_id, recipient: receiver_id, status: "accepted" },
      { recipient: sender_id, requester: receiver_id, status: "accepted" }
    ]
  });
  console.log("Sender:", sender_id.toString());
console.log("Receiver:", receiver_id.toString());
  console.log("Connection present:", connectionpresent);

  if (!connectionpresent) {
    return res.status(400).json(
      new Apiresponse(400, null, "You are not connected")
    );
  }

  let room = await Chatroom.findOne({
    participants: { $all: [sender_id, receiver_id] }
  });
console.log("Chatroom found:", room);
  if (!room) {
    room = await Chatroom.create({
      participants: [sender_id, receiver_id]
    });
  }

  return res.status(200).json(
    new Apiresponse(200, { chatroom_id: room._id }, "chatroom created successfully")
  );
});
// socket/socket.js
import { Server } from "socket.io";
import { cacheMessage } from "../utils/chatcache.js";
import {Message} from "../models/message.model.js"; 
let io;
//io is just variable which will hold the socket server instance and we will initialize that in the initSocket function and we will export that io variable so that we can use that in our controller to send or recieve data instantly without refreshing the page.


// userId → socketId mapping
const userSocketMap = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
    },
  });
  //here we are just initializing the socket server and we are just allowing all the origins to connect to our socket server and then we are just listening to the connection event and when a user connects to our socket server then we are just logging the user id and then we are just storing the user id and socket id in a map so that we can use that map to send or recieve data instantly without refreshing the page and then we are just listening to the join_room event and when a user joins a room then we are just adding that user to that room and then we are just logging the room id and 
  // then we are just listening to the leave_room event and when a user leaves a room then we are just removing that user from that room and then we are just logging the room id and then we are just listening to the disconnect event and when a user disconnects from our socket server then we are just logging the user id and then we are just removing that user from our map.

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    //whenever user connects to the socket that time we create a connection and we get the user id from the query parameters and then we store that user id and socket id in a map so that we can use that map to send or recieve data instantly without refreshing the page and 
    // then we are just listening to the join_room event 

    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
    }

    socket.on("join_room", (chatroomId) => {
      socket.join(chatroomId);
      console.log(`User joined room: ${chatroomId}`);
    });

    socket.on("leave_room", (chatroomId) => {
      socket.leave(chatroomId);
      console.log(`User left room: ${chatroomId}`);
    });

    // ✅ ADDED: real-time send message with Redis caching
    socket.on("send_message", async (data) => {
      try {
        const { chatroom_id, sender_id, receiver_id, message } = data;

        const newMessage = await Message.create({
          chatroom_id,
          sender_id,
          receiver_id,
          message
        });

        // 🔥 cache in redis
        await cacheMessage(chatroom_id, newMessage);

        // send to room
        io.to(chatroom_id).emit("receive_message", newMessage);

      } catch (error) {
        console.log("Socket send_message error:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (let [key, value] of userSocketMap.entries()) {
        if (value === socket.id) {
          userSocketMap.delete(key);
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

//means this socket is just used to send or recieve data instantly without refreshing the page and this is just used for chat application because in chat application we need to send or recieve data instantly without refreshing the page 
// and for that we use socket and we can use that socket in our controller to send or recieve data instantly without refreshing the page.









//it means this socket code is only for this chat application where only one user logged in at a time and that user can send or recieve data instantly without refreshing the page but 
// if we want to use this socket code for multiple users then we need to change the code a little bit and we need to use the user id and socket id mapping so that we can send or recieve data to specific user without refreshing the page and for that we need to create a map where we will store the user id and socket id and then we can use that map to send or recieve data to specific user without refreshing the page.
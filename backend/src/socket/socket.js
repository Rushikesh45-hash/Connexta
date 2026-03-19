// socket/socket.js
import { Server } from "socket.io";

let io;

// userId → socketId mapping
const userSocketMap = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

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
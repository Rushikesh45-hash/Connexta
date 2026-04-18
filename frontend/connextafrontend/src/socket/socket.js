import { io } from "socket.io-client";

let socket = null;

// this function will connect frontend to backend socket server
// and userId is passed in query so backend can store mapping
export const connectSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      query: { userId },
      withCredentials: true,
    });

    console.log("Socket Connected:", socket.id);
  }

  return socket;
};

// this function is used to get already connected socket instance
export const getSocket = () => socket;

// this function disconnects socket connection when user leaves the page
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket Disconnected");
  }
};
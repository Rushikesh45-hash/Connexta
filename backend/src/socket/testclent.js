import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  query: { userId: "123" }
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join_room", "room123");

  socket.on("receive_message", (data) => {
    console.log("Received:", data);
  });
});
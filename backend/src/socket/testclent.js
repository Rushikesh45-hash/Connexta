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

///to check this socket you need to run your backend in different terminal and create nother and run this file separately with node src/socket/testClient.js and then run sendmessage route then you see real time message
//but their are some condition like 1.Room must match means room id must match in roomchat table  
//2. both users are connected to each other before sending message
//3.userid must be correct in db 
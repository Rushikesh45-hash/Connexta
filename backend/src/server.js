import connectdb from "./db/connection.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { initSocket } from "./socket/socket.js";
dotenv.config();

connectdb()
.then(() => {
    const server = http.createServer(app);
    initSocket(server);
    server.listen(process.env.PORT || 3000, () => {
        console.log("Server + Socket running successfully");
    });

})
.catch((err) => {
    console.log("Connection error", err);
});
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import connectDB from "./src/db/connect.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

const ioServer = new Server({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

const app = createApp(ioServer);

const server = http.createServer(app);

ioServer.attach(server);

ioServer.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRooms", (userId) => {
    console.log(`User joined room: ${userId}`);
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(` Server running on ${process.env.CORS_ORIGIN}`);
  });
});

// index.js (or server.js)
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import connectDB from "./src/db/connect.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

// Create socket first
const ioServer = new Server({
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Create express app with io
const app = createApp(ioServer);

// Now attach express app to HTTP server
const server = http.createServer(app);

// Attach io to that HTTP server
ioServer.attach(server);

// Socket.io listeners
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

// Connect to DB and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./src/routes/user.routes.js";
import postRoute from "./src/routes/post.routes.js";
import commentRoute from "./src/routes/comment.routes.js";
import followRoute from "./src/routes/follower.routes.js";
import notificationRoute from "./src/routes/notification.route.js";
import FollowRequestRoute from "./src/routes/followrequest.route.js";
import PrivacyRoute from "./src/routes/privacy.route.js";
import NotificationPreferenceRoute from "./src/routes/notificationPreference.route.js";
import MessageRouter from "./src/routes/messages.route.js";

export function createApp(ioServer) {
  const app = express();

  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.CORS_ORIGIN?.replace(/\/$/, ""),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://twitty-v1.vercel.app",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman) or if allowed
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
          callback(null, true);
        } else {
          callback(null, true); // Fallback allow in dev
        }
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(cookieParser());

  // Attaching io to req just like req.user
  app.use((req, res, next) => {
    req.app.io = ioServer;
    next();
  });

  // Health check route
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date() });
  });

  // Routes
  app.use("/user", userRoute);
  app.use("/posts", postRoute);
  app.use("/comment", commentRoute);
  app.use("/follow", followRoute);
  app.use("/notification", notificationRoute);
  app.use("/follow_request", FollowRequestRoute);
  app.use("/privacy", PrivacyRoute);
  app.use("/notification_preference", NotificationPreferenceRoute);
  app.use("/message", MessageRouter);

  // Global Error Handler Middleware
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: err.errors || [],
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });

  return app;
}

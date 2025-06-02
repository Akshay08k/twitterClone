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
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(cookieParser());

  // Attach io instance to every request
  app.use((req, res, next) => {
    req.app.io = ioServer;
    next();
  });

  //Routes
  app.use("/user", userRoute);
  app.use("/posts", postRoute);
  app.use("/comment", commentRoute);
  app.use("/follow", followRoute);
  app.use("/notification", notificationRoute);
  app.use("/follow_request", FollowRequestRoute);
  app.use("/privacy", PrivacyRoute);
  app.use("/notification_preference", NotificationPreferenceRoute);
  app.use("/message", MessageRouter);

  return app;
}

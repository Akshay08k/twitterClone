// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./src/routes/user.routes.js";
import postRoute from "./src/routes/post.routes.js";
import commentRoute from "./src/routes/comment.routes.js";
import followRouter from "./src/routes/follower.routes.js";
import notificationRouter from "./src/routes/notification.route.js";
import FollowRequest from "./src/routes/followrequest.route.js";

export function createApp(ioServer) {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
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

  // Define routes
  app.use("/user", userRoute);
  app.use("/posts", postRoute);
  app.use("/comment", commentRoute);
  app.use("/follow", followRouter);
  app.use("/notification", notificationRouter);
  app.use("/follow_request", FollowRequest);

  return app;
}

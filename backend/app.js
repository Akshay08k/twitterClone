import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./src/routes/user.routes.js";
import postRoute from "./src/routes/post.routes.js";
import commentRoute from "./src/routes/comment.routes.js";
import followRouter from "./src/routes/follower.routes.js";
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

app.use("/user", userRoute);
app.use("/posts", postRoute);
app.use("/comment", commentRoute);
app.use("/follow", followRouter);

export { app };

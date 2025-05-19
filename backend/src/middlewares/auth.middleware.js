import User from "../Models/user.model.js";
import { ApiError, asyncHandler } from "../utils/index.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Access token missing");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select(
      "-passwordHash -refreshToken"
    );

    if (!user) throw new ApiError(401, "User not found");

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Invalid token");
  }
});

const validateToken = asyncHandler(async (req, res, next) => {
  if (req.user) next();
  else throw new ApiError(401, "User not authenticated");
});

export { verifyJWT, validateToken };

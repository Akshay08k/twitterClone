import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";
import Post from "../Models/post.model.js";
import { Comment } from "../models/comments.model.js";
import { PostLikes } from "../Models/postlikes.model.js";
import { Follower } from "../Models/follower.model.js";
import {
  ApiError,
  ApiResponce,
  uploadOnCloudinary,
  asyncHandler,
} from "../utils/index.js";
import bcrypt from "bcrypt";

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token)
      throw new ApiError(403, "Invalid refresh token");

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({ token: newAccessToken });
  } catch (error) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }
});

// ME
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-passwordHash -refreshToken -is_admin -password"
  );
  res.status(200).json(user);
});

const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select(
    "-passwordHash -refreshToken -is_admin -password -email"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const userPosts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
  const [userFollowers, userFollowing] = await Promise.all([
    Follower.find({ follower: user._id }),
    Follower.find({ user: user._id }),
  ]);

  const userPostsWithLikesInfo = await Promise.all(
    userPosts.map(async (post) => {
      const [likesCount, comments, commentsCount, userLiked] =
        await Promise.all([
          PostLikes.countDocuments({ post: post._id }),
          Comment.find({ post: post._id }),
          Comment.countDocuments({ post: post._id }),
          PostLikes.exists({ post: post._id, user: req.user?._id }),
        ]);

      return {
        ...post.toObject(),
        comments,
        commentsCount,
        likesCount,
        userLiked: !!userLiked,
      };
    })
  );

  res.status(200).json({
    user,
    userMeta: {
      followersCount: userFollowers.length,
      followingCount: userFollowing.length,
    },
    posts: userPostsWithLikesInfo,
  });
});

const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json({ message: "Logout successful" });
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, birthdate } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  let existedUser = await User.findOne({ $or: [{ username, email }] });
  if (existedUser) {
    throw new ApiError(401, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(
      500,
      "Something Went Wrong While Uploading Avatar  " +
        req.files?.avatar[0].path
    );
  }

  const avatarOnlinePath = await uploadOnCloudinary(avatarLocalPath);

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatarOnlinePath,
    birthdate,
  });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Something Went Wrong While Creating User");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, createdUser, "User Created Successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  user.refreshToken = refreshToken;
  await user.save();

  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200)
    .json({ message: "Login successful", token: accessToken, user: userData });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Incorrect Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Password Updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatarOnlinePath = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarOnlinePath) {
    throw new ApiError(500, "Something Went Wrong While Uploading Avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        avatar: avatarOnlinePath,
      },
    },
    {
      new: true,
    }
  ).select("-password -is_admin");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Avatar Updated Successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, bio, location, websiteLink } = req.body;

  if (!username || !bio || !location || !websiteLink) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username.toLowerCase(),
        bio: bio,
        location: location,
        website: websiteLink,
      },
    },
    {
      new: true,
    }
  ).select("-password -is_admin -avatar -bannerImage");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "User Details Updated Successfully"));
});

const updateBannerImage = asyncHandler(async (req, res) => {
  const bannerLocalPath = req.file?.path;

  if (!bannerLocalPath) {
    throw new ApiError(400, "Banner Image is required");
  }

  const bannerOnlinePath = await uploadOnCloudinary(bannerLocalPath);

  if (!bannerOnlinePath) {
    throw new ApiError(
      500,
      "Something Went Wrong While Uploading Banner Image"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        bannerImage: bannerOnlinePath,
      },
    },
    {
      new: true,
    }
  ).select("-password -is_admin");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Banner Image Updated Successfully"));
});

export {
  registerUser,
  login,
  logout,
  refreshAccessToken,
  me,
  updatePassword,
  updateUserAvatar,
  updateUserDetails,
  updateBannerImage,
  getUserByUsername,
};

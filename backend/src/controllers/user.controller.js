import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import NotificationPreference from "../models/notificationPreference.model.js";
import { PrivacySettings } from "../models/privacy.model.js";
import { Follower } from "../models/follower.model.js";
import {
  ApiError,
  ApiResponce,
  uploadOnCloudinary,
  asyncHandler,
} from "../utils/index.js";
import bcrypt from "bcrypt";
import generateUserHandle from "../utils/GenerateUserHandle.js";

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
        secure: true,
        sameSite: "None",
        maxAge: 15 * 60 * 1000,
      })
      .json({ token: newAccessToken });
  } catch (error) {
    throw new ApiError(403, "Invalid or expired refresh token");
  }
});

// ME
const me = asyncHandler(async (req, res) => {
  const user = await User
    .findById(req.user._id)
    .select("-passwordHash -refreshToken -is_admin -password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const followerCount = await Follower.countDocuments({ user: user._id });
  const followingCount = await Follower.countDocuments({ follower: user._id });

  // Convert Mongoose document to plain object to safely append values
  const userData = user.toObject();
  userData.followerCount = followerCount;
  userData.followingCount = followingCount;

  res.status(200).json({
    user: userData,
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
    userHandle: await generateUserHandle(),
  });

  await NotificationPreference.create({
    userId: user._id,
    likes: false,
    retweets: false,
    follows: false,
    mentions: false,
    directMessages: false,
    emailNotifications: false,
  });
  await PrivacySettings.create({
    userId: user._id,
    privateAccount: false,
    allowDirectMessages: false,
    allowMentions: true,
    showFollowers: true,
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
      secure: true,
      sameSite: "None",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
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

  const user = await User
    .findByIdAndUpdate(
      req.user?.id,
      {
        $set: {
          avatar: avatarOnlinePath,
        },
      },
      {
        new: true,
      }
    )
    .select("-password -is_admin");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Avatar Updated Successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, bio, location, websiteLink, userHandle } = req.body;

  if (!username || !bio || !location || !websiteLink || !userHandle) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          username: username.toLowerCase(),
          bio: bio,
          location: location,
          website: websiteLink,
          userHandle: userHandle.toLowerCase(),
        },
      },
      {
        new: true,
      }
    )
    .select("-password -is_admin -avatar -bannerImage -email");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "User Details Updated Successfully"));
});

const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Find user by username and exclude sensitive fields
  const user = await User
    .findOne({ username })
    .select("-passwordHash -refreshToken -is_admin -password -email");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isCurrentUser = req.user._id.toString() === user._id.toString();
  const isPrivateAccount = await PrivacySettings.findOne({ userId: user._id });
  // Check if requester is a follower
  const isFollower = await Follower.exists({
    user: user._id,
    follower: req.user._id,
  });

  const isPrivate = isPrivateAccount.privateAccount || false;
  const isRestricted = isPrivate && !isFollower && !isCurrentUser;

  const [userFollowers, userFollowing] = await Promise.all([
    Follower.find({ user: user._id }),
    Follower.find({ follower: user._id }),
  ]);

  const commonUserData = {
    _id: user._id,
    username: user.username,
    userHandle: user.userHandle,
    avatar: user.avatar,
    bannerImage: user.bannerImage,
    isPrivate: isPrivateAccount.privateAccount,
  };

  if (isRestricted) {
    return res.status(200).json({
      restricted: true,
      user: {
        ...commonUserData,
        bio: "This account is private.",
      },
      userMeta: {
        followersCount: userFollowers.length,
        followingCount: userFollowing.length,
      },
    });
  }

  return res.status(200).json({
    restricted: false,
    user: {
      ...commonUserData,
      bio: user.bio,
      location: user.location,
      website: user.website,
      createdAt: user.createdAt,
    },
    userMeta: {
      followersCount: userFollowers.length,
      followingCount: userFollowing.length,
    },
  });
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

  const user = await User
    .findByIdAndUpdate(
      req.user?.id,
      {
        $set: {
          bannerImage: bannerOnlinePath,
        },
      },
      {
        new: true,
      }
    )
    .select("-password -is_admin");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Banner Image Updated Successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user?._id);
  return res
    .status(200)
    .json(new ApiResponce(200, user, "Account Deleted Successfully"));
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
  deleteAccount,
};

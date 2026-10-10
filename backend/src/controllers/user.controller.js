import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import NotificationPreference from "../models/notificationPreference.model.js";
import { PrivacySettings } from "../models/privacy.model.js";
import { Follower } from "../models/follower.model.js";
import { Block } from "../models/block.model.js";
import FollowRequest from "../models/followRequest.mode.js";
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
  const user = await User.findById(req.user._id).select(
    "-passwordHash -refreshToken -is_admin -password"
  );

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

  let avatarOnlinePath = null;
  if (req.files?.avatar && req.files.avatar.length > 0) {
    let avatarLocalPath = req.files.avatar[0]?.path;

    if (avatarLocalPath) {
      avatarOnlinePath = await uploadOnCloudinary(avatarLocalPath);
    }
  }

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
  const { username, bio, location, websiteLink, website, userHandle } = req.body;

  const updateFields = {};
  if (username) updateFields.username = username.toLowerCase().trim();
  if (userHandle) {
    updateFields.userHandle = userHandle.toLowerCase().replace(/^@/, "").trim();
  }
  if (bio !== undefined) updateFields.bio = bio;
  if (location !== undefined) updateFields.location = location;
  if (websiteLink !== undefined) updateFields.website = websiteLink;
  if (website !== undefined) updateFields.website = website;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -is_admin -refreshToken -passwordHash");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "User Details Updated Successfully"));
});

const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Find user by username and exclude sensitive fields
  const user = await User.findOne({ username }).select(
    "-passwordHash -refreshToken -is_admin -password -email"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const currentUserId = req.user._id;
  const isCurrentUser = currentUserId.toString() === user._id.toString();

  // Check Block status in both directions
  const [isBlockedByMe, isBlockingMe] = await Promise.all([
    Block.exists({ blocker: currentUserId, blocked: user._id }),
    Block.exists({ blocker: user._id, blocked: currentUserId }),
  ]);

  if (isBlockingMe) {
    return res.status(200).json({
      restricted: true,
      isBlockingMe: true,
      isBlockedByMe: !!isBlockedByMe,
      user: {
        _id: user._id,
        username: user.username,
        userHandle: user.userHandle,
        avatar: user.avatar,
        bannerImage: user.bannerImage,
      },
      userMeta: {
        followersCount: 0,
        followingCount: 0,
      },
    });
  }

  const isPrivateAccount = await PrivacySettings.findOne({ userId: user._id });
  // Check if requester is a follower
  const isFollower = await Follower.exists({
    user: user._id,
    follower: currentUserId,
  });

  const isPrivate = isPrivateAccount?.privateAccount || false;
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
    isPrivate: isPrivate,
    isBlockedByMe: !!isBlockedByMe,
    isBlockingMe: false,
  };

  if (isRestricted) {
    return res.status(200).json({
      restricted: true,
      isBlockedByMe: !!isBlockedByMe,
      isBlockingMe: false,
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
    isBlockedByMe: !!isBlockedByMe,
    isBlockingMe: false,
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

const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user?._id);
  return res
    .status(200)
    .json(new ApiResponce(200, user, "Account Deleted Successfully"));
});

const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q || req.query.search || "";
  if (!query.trim()) {
    return res.status(200).json(new ApiResponce(200, [], "No search query provided"));
  }

  const clean = query.trim().replace(/^@/, "");
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const users = await User.find({
    $or: [
      { username: { $regex: escaped, $options: "i" } },
      { userHandle: { $regex: escaped, $options: "i" } },
    ],
  })
    .select("username userHandle avatar bio")
    .limit(15);

  return res.status(200).json(new ApiResponce(200, users, "Users found"));
});

const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;

  // Find users whom the current user is already following
  const following = await Follower.find({ follower: currentUserId }).select("user");
  const followingUserIds = following.map((f) => f.user);

  // Exclude current user, followed users, and blocked users (both directions)
  const blocks = await Block.find({
    $or: [{ blocker: currentUserId }, { blocked: currentUserId }],
  });
  const blockedUserIds = blocks.map((b) =>
    b.blocker.toString() === currentUserId.toString() ? b.blocked : b.blocker
  );

  const excludedIds = [currentUserId, ...followingUserIds, ...blockedUserIds];

  const suggestedUsers = await User.find({ _id: { $nin: excludedIds } })
    .select("username userHandle avatar bio")
    .limit(5);

  return res
    .status(200)
    .json(new ApiResponce(200, suggestedUsers, "Suggested users fetched successfully"));
});

const blockUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { targetUserId } = req.params;

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  if (currentUserId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot block yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Create or keep block record
  await Block.findOneAndUpdate(
    { blocker: currentUserId, blocked: targetUserId },
    { blocker: currentUserId, blocked: targetUserId },
    { upsert: true, new: true }
  );

  // Sever follow relationships in both directions
  await Promise.all([
    Follower.deleteMany({
      $or: [
        { user: currentUserId, follower: targetUserId },
        { user: targetUserId, follower: currentUserId },
      ],
    }),
    FollowRequest.deleteMany({
      $or: [
        { from: currentUserId, to: targetUserId },
        { from: targetUserId, to: currentUserId },
      ],
    }),
  ]);

  return res
    .status(200)
    .json(new ApiResponce(200, { isBlocked: true }, `Blocked @${targetUser.username}`));
});

const unblockUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { targetUserId } = req.params;

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  await Block.findOneAndDelete({
    blocker: currentUserId,
    blocked: targetUserId,
  });

  return res
    .status(200)
    .json(new ApiResponce(200, { isBlocked: false }, "User unblocked successfully"));
});

const getBlockedUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const blockedList = await Block.find({ blocker: currentUserId })
    .populate("blocked", "username userHandle avatar bio")
    .sort({ createdAt: -1 });

  const users = blockedList
    .filter((b) => b.blocked != null)
    .map((b) => b.blocked);

  return res
    .status(200)
    .json(new ApiResponce(200, users, "Blocked users retrieved successfully"));
});

const getBlockStatus = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { targetUserId } = req.params;

  const [isBlockedByMe, isBlockingMe] = await Promise.all([
    Block.exists({ blocker: currentUserId, blocked: targetUserId }),
    Block.exists({ blocker: targetUserId, blocked: currentUserId }),
  ]);

  return res.status(200).json(
    new ApiResponce(
      200,
      { isBlockedByMe: !!isBlockedByMe, isBlockingMe: !!isBlockingMe },
      "Block status fetched"
    )
  );
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
  searchUsers,
  getSuggestedUsers,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBlockStatus,
};

import {
  ApiError,
  ApiResponce,
  uploadOnCloudinary,
  asyncHandler,
} from "../utils/index.js";
import { Follower } from "../Models/follower.model.js";
import { Notification } from "../Models/notification.model.js";

const createFollower = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) throw new ApiError(400, "User ID is required");
  if (userId === req.user._id.toString())
    throw new ApiError(400, "You can't follow yourself");

  const alreadyFollowing = await Follower.findOne({
    user: req.user._id,
    follower: userId,
  });

  if (alreadyFollowing) throw new ApiError(400, "Already following");

  const newFollower = await Follower.create({
    user: req.user._id,
    follower: userId,
  });

  const existingNotification = await Notification.findOne({
    type: "follow",
    sourceUserId: req.user._id,
    receiverUserId: userId,
  });

  if (existingNotification) {
    existingNotification.isHidden = false;
    existingNotification.updatedAt = new Date();
    await existingNotification.save();
  } else {
    await Notification.create({
      type: "follow",
      sourceUserId: req.user._id,
      receiverUserId: userId,
      sourcePostId: null,
      content: `${req.user.username} started following you.`,
      is_read: false,
      isHidden: false,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponce(200, newFollower, "Followed and notified successfully")
    );
});

const getFollowers = asyncHandler(async (req, res) => {
  const followers = await Follower.find({ user: req.user._id }).populate(
    "follower",
    "username avatar"
  );
  return res
    .status(200)
    .json(new ApiResponce(200, followers, "Followers Fetched Successfully"));
});
const deleteFollower = asyncHandler(async (req, res) => {
  const { followerId } = req.params;

  if (!followerId) {
    throw new ApiError(400, "Follower ID is required");
  }

  // Delete the follower relationship
  const follower = await Follower.findOneAndDelete({
    user: req.user._id,
    follower: followerId,
  });

  if (!follower) {
    throw new ApiError(404, "Follower relationship not found");
  }

  // Delete the corresponding follow notification
  await Notification.findOneAndDelete({
    type: "follow",
    sourceUserId: req.user._id,
    receiverUserId: followerId,
  });

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        follower,
        "Follower deleted and notification removed"
      )
    );
});

const getFollowing = asyncHandler(async (req, res) => {
  const following = await Follower.find({ follower: req.user._id }).populate(
    "user",
    "username avatar"
  );
  return res
    .status(200)
    .json(new ApiResponce(200, following, "Following Fetched Successfully"));
});
const isFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const follower = await Follower.findOne({
    user: req.user._id,
    follower: userId,
  });

  const isFollowing = !!follower; // Convert to boolean
  return res
    .status(200)
    .json(
      new ApiResponce(200, isFollowing, "Following status fetched successfully")
    );
});

export {
  createFollower,
  getFollowers,
  deleteFollower,
  getFollowing,
  isFollowing,
};

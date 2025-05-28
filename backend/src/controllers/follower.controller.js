import {
  ApiError,
  ApiResponce,
  uploadOnCloudinary,
  asyncHandler,
} from "../utils/index.js";
import { Follower } from "../Models/follower.model.js";

const createFollower = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "All fields are required");
  }

  if (userId === req.user._id) {
    throw new ApiError(400, "You can't follow yourself");
  }

  const follower = await Follower.create({
    user: req.user._id,
    follower: userId,
  });
  return res
    .status(200)
    .json(new ApiResponce(200, follower, "Follower Created Successfully"));
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
    throw new ApiError(400, "All fields are required");
  }

  const follower = await Follower.findOneAndDelete({
    user: req.user._id,
    follower: followerId,
  });
  return res
    .status(200)
    .json(new ApiResponce(200, follower, "Follower Deleted Successfully"));
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

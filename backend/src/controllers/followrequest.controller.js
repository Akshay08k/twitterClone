import { asyncHandler } from "../utils/index.js";
import FollowRequest from "../models/followRequest.mode.js";
import { Follower } from "../models/follower.model.js";
import User from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { PrivacySettings } from "../models/privacy.model.js";

const sendFollowRequest = asyncHandler(async (req, res) => {
  const toUserId = req.params.id;
  const fromUserId = req.user._id;

  const toUser = await User.findById(toUserId);
  const isPrivateAccount = await PrivacySettings.findOne({ userId: toUserId });
  if (!toUser) throw new Error("User not found");

  const isAlreadyFollowing = await Follower.findOne({
    user: toUserId,
    follower: fromUserId,
  });
  if (isAlreadyFollowing)
    return res.status(400).json({ message: "Already following" });

  const existingRequest = await FollowRequest.findOne({
    from: fromUserId,
    to: toUserId,
  });
  if (existingRequest)
    return res.status(400).json({ message: "Request already sent" });

  if (isPrivateAccount.privateAccount) {
    await FollowRequest.create({ from: fromUserId, to: toUserId });
    return res.status(200).json({ requestSent: true });
  } else {
    await Follower.create({ user: toUserId, follower: fromUserId });
    return res.status(200).json({ followed: true });
  }
});

const getFollowRequestStatus = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.id;

  const request = await FollowRequest.findOne({
    from: currentUserId,
    to: targetUserId,
  });

  if (!request) {
    return res.json({ status: "false" });
  }

  return res.json({ status: request.status });
});

const withdrawFollowRequest = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const receiverId = req.params.id;

  await FollowRequest.deleteOne({
    from: currentUserId,
    to: receiverId,
  });

  res.json({ success: true, message: "Request withdrawn" });
});

const acceptFollowRequest = async (req, res) => {
  try {
    const toUserId = req.user.id;
    const { fromUserId } = req.params;

    const request = await FollowRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    await Follower.create({ user: toUserId, follower: fromUserId });

    await FollowRequest.findByIdAndUpdate(request._id, { status: "accepted" });

    const fromUser = await User.findById(fromUserId).select(
      "username userHandle"
    );

    await Notification.create({
      type: "follow",
      sourceUserId: toUserId,
      receiverUserId: fromUserId,
      is_read: false,
      isHidden: false,
      content: `${req.user.username} accepted your follow request`,
    });

    await Notification.create({
      type: "follow",
      sourceUserId: fromUserId,
      receiverUserId: toUserId,
      is_read: false,
      isHidden: false,
      content: `You accepted ${fromUser.username}'s follow request`,
    });

    return res.status(200).json({ message: "Follow request accepted" });
  } catch (error) {
    console.error("Error accepting follow request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteFollowRequest = async (req, res) => {
  try {
    const toUserId = req.user.id;
    const { fromUserId } = req.params;

    const request = await FollowRequest.findOne({
      from: fromUserId,
      to: toUserId,
    });
    if (!request) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    // Remove the follow request
    await FollowRequest.deleteOne({ _id: request._id });

    return res.status(200).json({ message: "Follow request deleted" });
  } catch (error) {
    console.error("Error deleting follow request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getPendingFollowRequests = async (req, res) => {
  try {
    const toUserId = req.user.id;

    const requests = await FollowRequest.find({ to: toUserId })
      .populate("from", "username userHandle avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching follow requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  sendFollowRequest,
  getFollowRequestStatus,
  withdrawFollowRequest,
  acceptFollowRequest,
  deleteFollowRequest,
  getPendingFollowRequests,
};

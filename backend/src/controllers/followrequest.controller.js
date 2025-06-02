// followController.js
import { asyncHandler } from "../utils/index.js";
import FollowRequest from "../Models/followRequest.mode.js";
import { Follower } from "../Models/follower.model.js";
import User from "../Models/user.model.js";
import { Notification } from "../Models/notification.model.js";
import { PrivacySettings } from "../Models/privacy.model.js";

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
    const toUserId = req.user.id; // Logged-in user accepting the request
    const { fromUserId } = req.params; // User who sent the request

    // Step 1: Find the follow request
    const request = await FollowRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    // Step 2: Create a follower relationship
    await Follower.create({ user: toUserId, follower: fromUserId });

    // Step 3: Update the follow request status to accepted
    await FollowRequest.findByIdAndUpdate(request._id, { status: "accepted" });

    // Step 4: Fetch user info (optional: to personalize notifications)
    const fromUser = await User.findById(fromUserId).select(
      "username userHandle"
    );

    // Step 5: Create a notification for the requester (they sent the request)
    await Notification.create({
      type: "follow",
      sourceUserId: toUserId,
      receiverUserId: fromUserId,
      is_read: false,
      isHidden: false,
      content: `${req.user.username} accepted your follow request`,
    });

    // Step 6: Create a notification for the accepter (you)
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
    const toUserId = req.user.id; // logged in user rejecting request
    const { fromUserId } = req.params; // user who sent the request

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
      .populate("from", "username userHandle avatar") // Get user info
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

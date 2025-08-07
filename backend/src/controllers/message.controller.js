import Messages from "../Models/messages.model.js";
import User from "../models/user.model.js";
import { Follower } from "../models/follower.model.js";
// Get conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const messages = await Messages.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "username avatar userHandle")
      .populate("receiver", "username avatar userHandle")
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser._id.toString())) {
        conversationMap.set(otherUser._id.toString(), {
          ...otherUser.toObject(),
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        });
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages between two users
export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const chatUserId = req.user._id;
    const messages = await Messages.find({
      $or: [
        { sender: userId, receiver: chatUserId },
        { sender: chatUserId, receiver: userId },
      ],
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { content, sender, receiver, attachments } = req.body;
    const newMessage = new Messages({
      content,
      sender,
      receiver,
      attachments: attachments || [],
    });

    await newMessage.save();

    await newMessage.populate("sender", "username avatar");

    // Emit to sender and receiver rooms
    req.app.io.to(receiver).emit("receiveMessage", newMessage);
    req.app.io.to(sender).emit("receiveMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Users who follow the current user
    const followers = await Follower.find({ user: currentUserId })
      .select("follower")
      .lean();

    // Users whom the current user follows
    const following = await Follower.find({ follower: currentUserId })
      .select("user")
      .lean();

    const followerIds = followers.map((f) => f.follower.toString());
    const followingIds = following.map((f) => f.user.toString());

    // Merge and remove duplicates
    const relatedUserIds = [...new Set([...followerIds, ...followingIds])];

    // Fetch related users' minimal info
    const users = await User.find({ _id: { $in: relatedUserIds } })
      .select("username userHandle avatar")
      .lean();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Get Chat Users Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

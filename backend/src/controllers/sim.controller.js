import sqliteDb from "../db/sqlite.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { Comment } from "../models/comments.model.js";
import Messages from "../models/messages.model.js";
import { PostLikes } from "../models/postlikes.model.js";
import { Notification } from "../models/notification.model.js";
import bcrypt from "bcrypt";

// In-memory mapping from SQLite Tweet ID to MongoDB Post ID for replies
const tweetIdMap = new Map();

// Helper to find or create MongoDB User for a simulated persona
const getOrCreateMongoUser = async ({ handle, name, bio, avatar_url }) => {
  const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();
  let user = await User.findOne({
    $or: [{ userHandle: cleanHandle }, { username: name }],
  });

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("simulated_bot_pass_123", salt);

    user = await User.create({
      username: name || cleanHandle,
      userHandle: cleanHandle,
      email: `${cleanHandle}@simulator.ai`,
      password: hashedPassword,
      bio: bio || "AI simulated persona on Twitty",
      avatar:
        avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanHandle)}`,
    });
  }

  return user;
};

// 1. Register Persona Endpoint (POST /api/sim/register)
export const registerSimUser = async (req, res) => {
  const { handle, name, bio, avatar_url } = req.body;
  if (!handle || !name) {
    return res.status(400).json({ error: "Handle and name are required" });
  }

  const query = `INSERT INTO users (handle, name, bio, avatar_url) VALUES (?, ?, ?, ?)`;

  sqliteDb.run(query, [handle, name, bio || "", avatar_url || ""], async function (err) {
    const exists = err && err.message && err.message.includes("UNIQUE constraint failed");
    if (err && !exists) {
      return res.status(500).json({ error: err.message });
    }

    try {
      // Dual-sync to MongoDB so simulated user appears on live site
      await getOrCreateMongoUser({ handle, name, bio, avatar_url });
    } catch (mongoErr) {
      console.warn("Mongo persona sync notice:", mongoErr.message);
    }

    if (exists) {
      return res.status(200).json({ status: "exists", message: "Already registered" });
    }

    return res.json({ status: "success" });
  });
};

// 2. Post Tweet or Reply Endpoint (POST /api/sim/post)
export const postSimTweet = async (req, res) => {
  const { handle, content, parent_id } = req.body;
  if (!handle || !content) {
    return res.status(400).json({ error: "Handle and content are required" });
  }

  const timestamp = new Date().toISOString();
  const query = `INSERT INTO tweets (handle, content, timestamp, parent_id) VALUES (?, ?, ?, ?)`;

  sqliteDb.run(query, [handle, content, timestamp, parent_id || null], async function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const sqliteTweetId = this.lastID;
    let mongoId = null;

    try {
      // Dual-sync to MongoDB
      const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();
      let user = await User.findOne({ userHandle: cleanHandle });

      if (!user) {
        user = await getOrCreateMongoUser({
          handle,
          name: cleanHandle,
          bio: "",
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
        });
      }

      if (!parent_id) {
        // Organic Main Post
        const extractedHashtags = [
          ...new Set(
            (content.match(/#[a-zA-Z0-9_\p{L}\p{N}]+/gu) || []).map((t) => t.toLowerCase())
          ),
        ];

        const newPost = await Post.create({
          description: content,
          user: user._id,
          hashtags: extractedHashtags,
          attachements: [],
        });

        mongoId = newPost._id;
        tweetIdMap.set(sqliteTweetId.toString(), newPost._id.toString());

        // Emit real-time socket event so users in browser see it immediately!
        if (req.app.io) {
          const populatedPost = await Post.findById(newPost._id).populate(
            "user",
            "username userHandle avatar"
          );
          req.app.io.emit("newPost", {
            ...populatedPost.toObject(),
            comments: [],
            commentsCount: 0,
            likesCount: 0,
            userLiked: false,
            isBookmarked: false,
          });
        }
      } else {
        // Threaded Reply / Comment
        let targetMongoPostId = tweetIdMap.get(parent_id.toString());

        // If parent_id is already a MongoDB ID or not in map, look up
        if (!targetMongoPostId) {
          if (typeof parent_id === "string" && parent_id.length === 24) {
            targetMongoPostId = parent_id;
          } else {
            // Find most recent matching post
            const latestPost = await Post.findOne().sort({ createdAt: -1 });
            if (latestPost) targetMongoPostId = latestPost._id.toString();
          }
        }

        if (targetMongoPostId) {
          const newComment = await Comment.create({
            content,
            user: user._id,
            post: targetMongoPostId,
          });
          mongoId = newComment._id;

          await newComment.populate("user", "username avatar userHandle");
          if (req.app.io) {
            req.app.io.emit("newComment", {
              postId: targetMongoPostId,
              comment: newComment,
            });
          }
        }
      }
    } catch (syncErr) {
      console.warn("Mongo post sync notice:", syncErr.message);
    }

    return res.json({
      status: "success",
      tweet_id: sqliteTweetId,
      mongo_id: mongoId,
    });
  });
};

// 3. Query Simulated Tweets (GET /api/sim/tweets)
export const getSimTweets = (req, res) => {
  const { parent_id } = req.query;
  let sql = `SELECT * FROM tweets ORDER BY id DESC LIMIT 50`;
  const params = [];

  if (parent_id === "null" || parent_id === "none") {
    sql = `SELECT * FROM tweets WHERE parent_id IS NULL ORDER BY id DESC LIMIT 50`;
  } else if (parent_id) {
    sql = `SELECT * FROM tweets WHERE parent_id = ? ORDER BY id ASC`;
    params.push(parent_id);
  }

  sqliteDb.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ status: "success", count: rows.length, tweets: rows });
  });
};

// 4. Query Simulated Users (GET /api/sim/users)
export const getSimUsers = (req, res) => {
  sqliteDb.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ status: "success", count: rows.length, users: rows });
  });
};

// 5. Send Simulated Direct Message (POST /api/sim/message)
export const sendSimMessage = async (req, res) => {
  const { senderHandle, receiverHandle, content } = req.body;
  if (!senderHandle || !receiverHandle || !content) {
    return res.status(400).json({ error: "senderHandle, receiverHandle, and content are required" });
  }

  try {
    const cleanSender = senderHandle.replace(/^@/, "").trim().toLowerCase();
    const cleanReceiver = receiverHandle.replace(/^@/, "").trim().toLowerCase();

    const [senderUser, receiverUser] = await Promise.all([
      User.findOne({
        $or: [{ userHandle: cleanSender }, { username: new RegExp(`^${cleanSender}$`, "i") }],
      }),
      User.findOne({
        $or: [{ userHandle: cleanReceiver }, { username: new RegExp(`^${cleanReceiver}$`, "i") }],
      }),
    ]);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({
        error: `User not found in DB. Sender found: ${!!senderUser}, Receiver found: ${!!receiverUser}`,
      });
    }

    const newMessage = await Messages.create({
      content,
      sender: senderUser._id,
      receiver: receiverUser._id,
      attachements: [],
    });

    await newMessage.populate("sender", "username userHandle avatar");

    if (req.app.io) {
      req.app.io.to(receiverUser._id.toString()).emit("receiveMessage", newMessage);
      req.app.io.to(senderUser._id.toString()).emit("receiveMessage", newMessage);
    }

    return res.json({
      status: "success",
      message_id: newMessage._id,
      sender: senderUser.username,
      receiver: receiverUser.username,
    });
  } catch (err) {
    console.error("sendSimMessage error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 6. Get Available Handles for Messaging (GET /api/sim/handles)
export const getActiveHandles = async (req, res) => {
  try {
    const users = await User.find({}, "username userHandle avatar bio").sort({ createdAt: -1 }).limit(50);
    return res.json({
      status: "success",
      users: users.map((u) => ({
        id: u._id,
        username: u.username,
        handle: `@${u.userHandle || u.username}`,
        avatar: u.avatar,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 7. Get Recent Posts for Agent Interactions (GET /api/sim/posts)
export const getRecentPostsForInteraction = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user", "username userHandle avatar email")
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ status: "success", posts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 8. Like Simulated Post Endpoint (POST /api/sim/like)
export const postSimLike = async (req, res) => {
  const { handle, tweet_id, post_id } = req.body;
  if (!handle || (!tweet_id && !post_id)) {
    return res.status(400).json({ error: "Handle and tweet_id or post_id are required" });
  }

  try {
    const cleanHandle = handle.replace(/^@/, "").trim().toLowerCase();
    let user = await User.findOne({ userHandle: cleanHandle });
    if (!user) {
      user = await getOrCreateMongoUser({
        handle,
        name: cleanHandle,
        bio: "",
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
      });
    }

    // Resolve target MongoDB post
    let targetMongoPostId = post_id;
    if (!targetMongoPostId && tweet_id) {
      targetMongoPostId = tweetIdMap.get(tweet_id.toString());
      if (!targetMongoPostId) {
        const latestPost = await Post.findOne().sort({ createdAt: -1 });
        if (latestPost) targetMongoPostId = latestPost._id.toString();
      }
    }

    if (!targetMongoPostId) {
      return res.status(404).json({ error: "Target post not found" });
    }

    // SQLite dual-write
    const timestamp = new Date().toISOString();
    sqliteDb.run(
      `INSERT OR IGNORE INTO likes (handle, tweet_id, timestamp) VALUES (?, ?, ?)`,
      [handle, tweet_id || null, timestamp],
      (err) => {
        if (err) console.warn("SQLite like notice:", err.message);
      }
    );

    // MongoDB PostLikes
    const existingLike = await PostLikes.findOne({ post: targetMongoPostId, user: user._id });
    if (!existingLike) {
      await PostLikes.create({ post: targetMongoPostId, user: user._id });

      const targetPost = await Post.findById(targetMongoPostId);
      if (targetPost && targetPost.user.toString() !== user._id.toString()) {
        const notif = await Notification.create({
          receiverUserId: targetPost.user,
          sourceUserId: user._id,
          sourcePostId: targetMongoPostId,
          type: "like",
          content: `${user.username} liked your post`,
          is_read: false,
          isHidden: false,
        });

        if (req.app.io) {
          req.app.io.to(targetPost.user.toString()).emit("notification", notif);
        }
      }
    }

    const updatedLikesCount = await PostLikes.countDocuments({ post: targetMongoPostId });

    if (req.app.io) {
      req.app.io.emit("postLiked", {
        postId: targetMongoPostId,
        likesCount: updatedLikesCount,
        handle,
      });
    }

    return res.json({
      status: "success",
      post_id: targetMongoPostId,
      likesCount: updatedLikesCount,
      handle,
    });
  } catch (err) {
    console.error("postSimLike error:", err);
    return res.status(500).json({ error: err.message });
  }
};


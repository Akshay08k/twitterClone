import {
  ApiError,
  ApiResponce,
  uploadOnCloudinary,
  asyncHandler,
} from "../utils/index.js";
import { Comment } from "../models/comments.model.js";
import Post from "../models/post.model.js";
import { PostLikes } from "../models/postlikes.model.js";
import { Notification } from "../models/notification.model.js";
import { Bookmark } from "../models/bookmark.model.js";
import { Follower } from "../models/follower.model.js";
import { Block } from "../models/block.model.js";

const createPost = asyncHandler(async (req, res) => {
  const { description } = req.body;
  let postImagesOnlinePath = null;

  if (!description && !req.files?.postImages) {
    throw new ApiError(400, "Description or image is required");
  }

  try {
    if (req.files?.postImages && req.files.postImages.length > 0) {
      const postImages = req.files.postImages[0].path;
      postImagesOnlinePath = await uploadOnCloudinary(postImages);
    }

    const extractedHashtags = description
      ? [
          ...new Set(
            (description.match(/#[a-zA-Z0-9_\p{L}\p{N}]+/gu) || []).map((t) =>
              t.toLowerCase()
            )
          ),
        ]
      : [];

    const post = await Post.create({
      description: description || "",
      hashtags: extractedHashtags,
      user: req.user._id,
      attachements: postImagesOnlinePath ? [postImagesOnlinePath] : [],
    });

    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "-passwordHash -refreshToken -password"
    );

    const fullPost = {
      ...populatedPost.toObject(),
      comments: [],
      commentsCount: 0,
      likesCount: 0,
      userLiked: false,
      isBookmarked: false,
    };

    if (req.app.io) {
      req.app.io.emit("newPost", fullPost);
    }

    return res
      .status(200)
      .json(new ApiResponce(200, fullPost, "Post Created Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong while creating the post");
  }
});

const getSinglePost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const postId = req.params.postId;

  const post = await Post.findById(postId).populate(
    "user",
    "-passwordHash -refreshToken -password"
  );

  if (!post) {
    return res.status(404).json(new ApiResponce(404, null, "Post Not Found"));
  }

  const [postLikesCount, comments, postCommentsCount, userLiked, isBookmarked] =
    await Promise.all([
      PostLikes.countDocuments({ post: postId }),
      Comment.find({ post: postId })
        .populate("user", "username avatar userHandle")
        .sort({ createdAt: -1 }),
      Comment.countDocuments({ post: postId }),
      PostLikes.exists({ post: postId, user: userId }),
      Bookmark.exists({ post: postId, user: userId }),
    ]);

  const postWithDetails = {
    ...post.toObject(),
    comments: comments,
    commentsCount: postCommentsCount,
    likesCount: postLikesCount,
    userLiked: !!userLiked,
    isBookmarked: !!isBookmarked,
  };

  return res
    .status(200)
    .json(new ApiResponce(200, postWithDetails, "Post Fetched Successfully"));
});

const PostLikeHandler = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const existingLike = await PostLikes.findOne({ post: postId, user: userId });

  // If already liked, remove like and hide notification
  if (existingLike) {
    await PostLikes.findByIdAndDelete(existingLike._id);
    await Notification.findOneAndUpdate(
      {
        type: "like",
        sourceUserId: userId,
        receiverUserId: post.user,
        sourcePostId: postId,
      },
      { isHidden: true }
    );

    const updatedLikesCount = await PostLikes.countDocuments({ post: postId });
    return res.status(200).json(
      new ApiResponce(
        200,
        { isLiked: false, likesCount: updatedLikesCount },
        "Post unliked successfully"
      )
    );
  }

  // Prevent notification if liking own post
  const isSelfLike = post.user.toString() === userId.toString();
  if (!isSelfLike) {
    const existingNotification = await Notification.findOne({
      type: "like",
      sourceUserId: userId,
      receiverUserId: post.user,
      sourcePostId: postId,
    });

    if (existingNotification) {
      existingNotification.isHidden = false;
      existingNotification.updatedAt = new Date();
      await existingNotification.save();
    } else {
      await Notification.create({
        receiverUserId: post.user,
        sourceUserId: userId,
        sourcePostId: postId,
        type: "like",
        content: `${req.user.username} liked your post`,
        is_read: false,
        isHidden: false,
      });
    }
  }

  await PostLikes.create({ post: postId, user: userId });
  const updatedLikesCount = await PostLikes.countDocuments({ post: postId });

  return res.status(200).json(
    new ApiResponce(
      200,
      { isLiked: true, likesCount: updatedLikesCount },
      "Post liked successfully"
    )
  );
});

const getPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type, search } = req.query;

  let query = {};

  if (type === "following") {
    const followings = await Follower.find({ follower: userId }).select("user");
    const followedUserIds = followings.map((f) => f.user);
    // Include user's own posts plus people they follow
    query.user = { $in: [...followedUserIds, userId] };
  }

  if (search && search.trim()) {
    const rawSearch = search.trim();
    const cleanTag = rawSearch.startsWith("#")
      ? rawSearch.toLowerCase()
      : `#${rawSearch.toLowerCase()}`;
    const escaped = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { description: { $regex: escaped, $options: "i" } },
      { hashtags: cleanTag },
    ];
  }

  // Exclude posts from blocked users (in either direction)
  const blocks = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }],
  });
  const blockedUserIds = blocks.map((b) =>
    b.blocker.toString() === userId.toString() ? b.blocked : b.blocker
  );

  if (blockedUserIds.length > 0) {
    if (query.user && query.user.$in) {
      query.user.$in = query.user.$in.filter(
        (id) => !blockedUserIds.some((bId) => bId.toString() === id.toString())
      );
    } else {
      query.user = { $nin: blockedUserIds };
    }
  }

  const posts = await Post.find(query)
    .populate("user", "-passwordHash -refreshToken -is_admin -password")
    .sort({ createdAt: -1 })
    .limit(50);

  const postsWithLikesInfo = await Promise.all(
    posts.map(async (post) => {
      const [postLikesCount, comments, postCommentsCount, userLiked, isBookmarked] =
        await Promise.all([
          PostLikes.countDocuments({ post: post._id }),
          Comment.find({ post: post._id })
            .populate("user", "username avatar userHandle")
            .sort({ createdAt: -1 })
            .limit(5),
          Comment.countDocuments({ post: post._id }),
          PostLikes.exists({ post: post._id, user: userId }),
          Bookmark.exists({ post: post._id, user: userId }),
        ]);

      return {
        ...post.toObject(),
        comments,
        commentsCount: postCommentsCount,
        likesCount: postLikesCount,
        userLiked: !!userLiked,
        isBookmarked: !!isBookmarked,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponce(200, postsWithLikesInfo, "Posts Fetched Successfully")
    );
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Security check: Only post owner can delete
  if (post.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await Post.findByIdAndDelete(postId);

  // Cascade delete likes, comments, notifications, bookmarks
  await Promise.all([
    PostLikes.deleteMany({ post: postId }),
    Comment.deleteMany({ post: postId }),
    Notification.deleteMany({ sourcePostId: postId }),
    Bookmark.deleteMany({ post: postId }),
  ]);

  if (req.app.io) {
    req.app.io.emit("postDeleted", postId);
  }

  return res
    .status(200)
    .json(new ApiResponce(200, { postId }, "Post Deleted Successfully"));
});

const fetchingPostsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user?._id;

  // Check if either user has blocked the other
  if (currentUserId && userId && currentUserId.toString() !== userId.toString()) {
    const isBlocked = await Block.exists({
      $or: [
        { blocker: currentUserId, blocked: userId },
        { blocker: userId, blocked: currentUserId },
      ],
    });
    if (isBlocked) {
      return res.status(200).json(new ApiResponce(200, [], "Posts not available"));
    }
  }

  const posts = await Post.find({ user: userId })
    .populate("user", "-passwordHash -refreshToken -is_admin -password -email")
    .sort({ createdAt: -1 });

  const postsWithMeta = await Promise.all(
    posts.map(async (post) => {
      const [likesCount, comments, commentsCount, userLiked, isBookmarked] =
        await Promise.all([
          PostLikes.countDocuments({ post: post._id }),
          Comment.find({ post: post._id })
            .populate("user", "username avatar userHandle")
            .sort({ createdAt: -1 })
            .limit(5),
          Comment.countDocuments({ post: post._id }),
          PostLikes.exists({ post: post._id, user: currentUserId }),
          Bookmark.exists({ post: post._id, user: currentUserId }),
        ]);

      return {
        ...post.toObject(),
        comments,
        commentsCount,
        likesCount,
        userLiked: !!userLiked,
        isBookmarked: !!isBookmarked,
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponce(200, postsWithMeta, "Posts Fetched Successfully"));
});

// Bookmark Handler
const toggleBookmark = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const existingBookmark = await Bookmark.findOne({ post: postId, user: userId });

  if (existingBookmark) {
    await Bookmark.findByIdAndDelete(existingBookmark._id);
    return res
      .status(200)
      .json(new ApiResponce(200, { isBookmarked: false }, "Bookmark removed"));
  }

  await Bookmark.create({ post: postId, user: userId });
  return res
    .status(200)
    .json(new ApiResponce(200, { isBookmarked: true }, "Post bookmarked"));
});

const getBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookmarks = await Bookmark.find({ user: userId })
    .populate({
      path: "post",
      populate: {
        path: "user",
        select: "-passwordHash -refreshToken -is_admin -password -email",
      },
    })
    .sort({ createdAt: -1 });

  const validBookmarkedPosts = bookmarks
    .filter((b) => b.post != null)
    .map((b) => b.post);

  const postsWithMeta = await Promise.all(
    validBookmarkedPosts.map(async (post) => {
      const [likesCount, commentsCount, userLiked] = await Promise.all([
        PostLikes.countDocuments({ post: post._id }),
        Comment.countDocuments({ post: post._id }),
        PostLikes.exists({ post: post._id, user: userId }),
      ]);

      return {
        ...post.toObject(),
        commentsCount,
        likesCount,
        userLiked: !!userLiked,
        isBookmarked: true,
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponce(200, postsWithMeta, "Bookmarks fetched successfully"));
});

const getTrendingHashtags = asyncHandler(async (req, res) => {
  const posts = await Post.find({}, "description hashtags createdAt")
    .sort({ createdAt: -1 })
    .limit(500);

  const hashtagCounts = {};

  posts.forEach((post) => {
    const foundTags = new Set();
    if (Array.isArray(post.hashtags) && post.hashtags.length > 0) {
      post.hashtags.forEach((t) => foundTags.add(t.toLowerCase()));
    }
    if (post.description) {
      const tags = post.description.match(/#[a-zA-Z0-9_\p{L}\p{N}]+/gu);
      if (tags) {
        tags.forEach((t) => foundTags.add(t.toLowerCase()));
      }
    }
    foundTags.forEach((t) => {
      hashtagCounts[t] = (hashtagCounts[t] || 0) + 1;
    });
  });

  const trends = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({
      tag,
      postsCount: count,
      category: "Trending",
    }));

  return res
    .status(200)
    .json(new ApiResponce(200, trends, "Trending hashtags fetched successfully"));
});

export {
  createPost,
  getPosts,
  PostLikeHandler,
  getSinglePost,
  deletePost,
  fetchingPostsByUserId,
  toggleBookmark,
  getBookmarks,
  getTrendingHashtags,
};

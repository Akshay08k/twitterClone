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

const createPost = asyncHandler(async (req, res) => {
  const { description } = req.body;
  let postImagesOnlinePath;

  if (!description) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    if (req.files?.postImages) {
      const postImages = req.files.postImages[0].path;
      postImagesOnlinePath = await uploadOnCloudinary(postImages);
    }

    const post = await Post.create({
      description,
      user: req.user._id,
      attachements: postImagesOnlinePath,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user")
      .populate("attachements");

    const fullPost = {
      ...populatedPost.toObject(),
      comments: [],
      commentsCount: 0,
      likesCount: 0,
      userLiked: false,
    };

    req.app.io.emit("newPost", fullPost);

    return res
      .status(200)
      .json(new ApiResponce(200, fullPost, "Post Created Successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while creating the post");
  }
});

const getSinglePost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const postId = req.params.postId;

  const post = await Post.findById(postId)
    .populate("user")
    .populate("attachements");

  if (!post) {
    return res.status(404).json(new ApiResponce(404, null, "Post Not Found"));
  }

  const postLikesCount = await PostLikes.countDocuments({ post: postId });
  const comments = await Comment.find({ post: postId });
  const postCommentsCount = await Comment.countDocuments({ post: postId });
  const userLiked = await PostLikes.exists({ post: postId, user: userId });

  const postWithDetails = {
    ...post.toObject(),
    comments: comments,
    commentsCount: postCommentsCount,
    likesCount: postLikesCount,
    userLiked: !!userLiked,
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

    return res
      .status(200)
      .json(new ApiResponce(200, {}, "Post unliked successfully"));
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

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Post liked successfully"));
});

const getPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const posts = await Post.find().populate("user").populate("attachements");
  const postsWithLikesInfo = await Promise.all(
    posts.map(async (post) => {
      const postLikesCount = await PostLikes.countDocuments({ post: post._id });
      const comments = await Comment.find({ post: post._id });
      const postCommentsCount = await Comment.countDocuments({
        post: post._id,
      });
      const userLiked = await PostLikes.exists({
        post: post._id,
        user: userId,
      }).select("-password -is_admin -email -refreshToken -passwordHash -isPrivateAccount");

      return {
        ...post.toObject(),
        comments: comments,
        commentsCount: postCommentsCount,
        likesCount: postLikesCount,
        userLiked: !!userLiked,
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

  const deletedPost = await Post.findByIdAndDelete(postId);

  if (!deletedPost) {
    throw new ApiError(404, "Post not found");
  }

  req.app.io.emit("postDeleted", postId);

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Post Deleted Successfully"));
});

const fetchingPostsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const posts = await Post.find({ user: userId })
    .populate("user", "-passwordHash -refreshToken -is_admin -password -email")
    .sort({ createdAt: -1 });

  const postsWithMeta = await Promise.all(
    posts.map(async (post) => {
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

  return res
    .status(200)
    .json(new ApiResponce(200, postsWithMeta, "Posts Fetched Successfully"));
});

export {
  createPost,
  getPosts,
  PostLikeHandler,
  getSinglePost,
  deletePost,
  fetchingPostsByUserId,
};

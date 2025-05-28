import {
  ApiError,
  ApiResponce,
  uploadOnCloudinary,
  asyncHandler,
} from "../utils/index.js";
import { Comment } from "../models/comments.model.js";
import Post from "../Models/post.model.js";
import { PostLikes } from "../Models/postlikes.model.js";

const createPost = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description) {
    throw new ApiError(400, "All fields are required");
  }
  const postImages = req.files?.postImages[0]?.path;

  const postImagesOnlinePath = await uploadOnCloudinary(postImages);

  const post = await Post.create({
    description,
    user: req.user._id,
    attachements: postImagesOnlinePath,
  });
  return res
    .status(200)
    .json(new ApiResponce(200, post, "Post Created Successfully"));
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

  if (!post) {
    throw new ApiError(404, "Post Not Found");
  }

  const existingLike = await PostLikes.findOne({
    post: postId,
    user: userId,
  });

  if (existingLike) {
    await PostLikes.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponce(200, {}, "Post Unliked Successfully"));
  } else {
    await PostLikes.create({
      post: postId,
      user: userId,
    });
    return res
      .status(200)
      .json(new ApiResponce(200, {}, "Post Liked Successfully"));
  }
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
      });

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

export { createPost, getPosts, PostLikeHandler, getSinglePost };

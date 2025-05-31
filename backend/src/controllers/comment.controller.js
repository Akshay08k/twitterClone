import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import User from "../Models/user.model.js";
import { Comment } from "../models/comments.model.js";
import { Notification } from "../Models/notification.model.js";
import Post from "../Models/post.model.js";
const getComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const comments = await Comment.find({ post: postId }).populate(
    "user",
    "username avatar"
  );

  return res
    .status(200)
    .json(new ApiResponce(200, comments, "Comments Fetched Successfully"));
});

const createComment = asyncHandler(async (req, res) => {
  const { postId, content, parentCommentId } = req.body;

  if (!content || !postId) {
    throw new ApiError(400, "Post ID and content are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const commentData = {
    content,
    user: user._id,
    post: postId,
  };

  if (parentCommentId) {
    commentData.parentComment = parentCommentId;
  }

  const commentCreated = await Comment.create(commentData);

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: commentCreated._id },
    });
  }

  let receiverUserId = null;
  let notificationContent = null;

  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId).populate(
      "user"
    );
    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    receiverUserId = parentComment.user._id;

    if (receiverUserId.toString() !== user._id.toString()) {
      notificationContent = `${user.username} replied to your comment`;
    }
  } else {
    const post = await Post.findById(postId).populate("user");
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    receiverUserId = post.user._id;
    

    if (receiverUserId.toString() !== user._id.toString()) {
      notificationContent = `${user.username} commented on your post`;
    }
  }

  if (notificationContent && receiverUserId) {
    await Notification.create({
      type: "comment",
      sourceUserId: user._id,
      receiverUserId,
      sourcePostId: postId,
      content: notificationContent,
      is_read: false,
      isHidden: false,
    });
  }

  return res
    .status(200)
    .json(new ApiResponce(200, commentCreated, "Comment created successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment Not Found");
  }

  const commentDeleted = await Comment.findByIdAndDelete(commentId);
  return res
    .status(200)
    .json(new ApiResponce(200, commentDeleted, "Comment Deleted Successfully"));
});

export { createComment, getComments, deleteComment };

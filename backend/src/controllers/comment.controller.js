import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import { Comment } from "../models/comments.model.js";

const getComments = asyncHandler(async (req, res) => {
    const postId = req.params.postId;

    const comments = await Comment.find({ post: postId })
    return res.status(200).json(new ApiResponce(200, comments, "Comments Fetched Successfully"));
});

const createComment = asyncHandler(async (req, res) => {
    const { postId, content, parentCommentId } = req.body;

    if (!content) {
        throw new ApiError(400, "All fields are required");
    }

    const commentData = {
        content,
        user: req.user._id,
        post: postId
    };

    // Add parentComment if it's a reply
    if (parentCommentId) {
        commentData.parentComment = parentCommentId;
    }

    const commentCreated = await Comment.create(commentData);

    // If it's a reply, update the parent comment's replies
    if (parentCommentId) {
        await Comment.findByIdAndUpdate(parentCommentId, {
            $push: { replies: commentCreated._id }
        });
    }

    return res.status(200).json(new ApiResponce(200, commentCreated, "Comment Created Successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(400, "Comment Not Found");
    }

    const commentDeleted = await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponce(200, commentDeleted, "Comment Deleted Successfully"));
});



export { createComment, getComments, deleteComment }
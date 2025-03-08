import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import { Comment } from "../models/comments.model.js";

const getComments = asyncHandler(async (req, res) => {
    const postId = req.params.postId;

    const comments = await Comment.find({ post: postId })
    return res.status(200).json(new ApiResponce(200, comments, "Comments Fetched Successfully"));
})
const createComment = asyncHandler(async (req, res) => {
    const { postId } = req.body;
    const { comment } = req.body;
    if (!comment) {
        throw new ApiError(400, "All fields are required");
    }
    const commentCreated = await Comment.create({
        comment,
        user: req.user._id,
        post: postId
    })
    return res.status(200).json(new ApiResponce(200, commentCreated, "Comment Created Successfully"));
})

export { createComment, getComments }
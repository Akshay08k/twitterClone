import { asyncHandler, ApiError, ApiResponce } from "../utils/index.js";
import { Comment } from "../models/comments.model.js";

const createComment = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;
        const comment = await Comment.create({
            user: req.user._id,
            post: postId,
            content
        })
        return res.status(200).json(new ApiResponce(200, comment, "Comment Created Successfully"));
    } catch (err) {
        throw new ApiError(500, `Something Went Wrong While Creating Comment Error: ${err}`);
    }
})

export { createComment }
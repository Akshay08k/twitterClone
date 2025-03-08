import mongoose from "mongoose";
import { Schema } from "mongoose";

const PostLikesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
}, {
    timestamps: true
})

PostLikesSchema.index({ post: 1, user: 1 }, { unique: true });

const countPostLikes = async (postId) => {
    try {
        return await PostLikes.countDocuments({ post: postId });
    } catch (error) {
        console.error("Error counting post likes:", error);
        throw error;
    }
};


export const PostLikes = mongoose.model("PostLikes", PostLikesSchema);
export { countPostLikes }
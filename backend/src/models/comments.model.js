import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mention: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false
    }],
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false
    }
}, {
    timestamps: true
}
)

export const Comment = mongoose.model("Comment", CommentSchema);

import mongoose, { Mongoose, Schema } from "mongoose";

const PostSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    attachements: {
        type: [String],
        default: [],
        trim: true,
        required: false
    }
}, {
    timestamps: true
})

export const Post = mongoose.model("Post", PostSchema);
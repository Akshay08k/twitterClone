import { Schema } from "mongoose";

const BookmarkSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
}, {
    timestamps: true
});

export const Bookmark = mongoose.model("Bookmark", BookmarkSchema);
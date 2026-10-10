import mongoose, { Schema } from "mongoose";

const BookmarkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

export const Bookmark =
  mongoose.models.Bookmark || mongoose.model("Bookmark", BookmarkSchema);
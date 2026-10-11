import mongoose, { Schema } from "mongoose";

const UserInteractionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: false,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    type: {
      type: String,
      enum: [
        "view",          // Viewed in feed
        "dwell",         // Lingered for > 1.5s
        "click",         // Clicked to view single post detail
        "like",          // Liked post
        "comment",       // Replied/commented on post
        "bookmark",      // Saved to bookmarks
        "profile_visit", // Visited user profile
        "search",        // Searched tag/topic
        "dismiss",       // "Not interested" negative feedback
      ],
      required: true,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    dwellTimeMs: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      required: true,
      default: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

UserInteractionSchema.index({ user: 1, createdAt: -1 });
UserInteractionSchema.index({ user: 1, type: 1 });
UserInteractionSchema.index({ user: 1, post: 1, type: 1 });

const UserInteraction =
  mongoose.models.UserInteraction ||
  mongoose.model("UserInteraction", UserInteractionSchema);

export default UserInteraction;

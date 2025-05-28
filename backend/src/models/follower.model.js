import mongoose, { Schema } from "mongoose";

const FollowerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
FollowerSchema.index({ user: 1, follower: 1 }, { unique: true });
export const Follower = mongoose.model("Follower", FollowerSchema);

import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    likes: { type: Boolean, default: true },
    retweets: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    directMessages: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model(
  "NotificationSettings",
  notificationSettingsSchema
);

import mongoose from "mongoose";

const privacySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    privateAccount: { type: Boolean, default: false },
    allowMentions: { type: Boolean, default: true },
    showFollowers: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PrivacySettings = mongoose.model(
  "PrivacySettings",
  privacySettingsSchema
);

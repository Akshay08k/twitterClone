import mongoose from "mongoose";
import { Schema } from "mongoose";

const MessagesSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    attachements: {
      type: [String],
      default: [],
      trim: true,
      required: false,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Messages = mongoose.model("Message", MessagesSchema);

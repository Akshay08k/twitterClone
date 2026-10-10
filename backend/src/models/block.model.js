import mongoose, { Schema } from "mongoose";

const BlockSchema = new Schema(
  {
    blocker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blocked: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const Block = mongoose.models.Block || mongoose.model("Block", BlockSchema);
export default Block;

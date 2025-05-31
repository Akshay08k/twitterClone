import mongoose from "mongoose";
const followRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // requester
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // profile owner
  status: { type: String, enum: ["pending", "accepted"], default: "pending" },
});

const FollowRequest = mongoose.model("FollowRequest", followRequestSchema);
export default FollowRequest;
import { Schema } from "mongoose";

const FollowerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    follower: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, {
    timestamps: true
});

export const Follower = mongoose.model("Follower", FollowerSchema);

import { Schema } from "mongoose";

const NotificationSchema = new Schema({
    //     id
    // type(retweet,follow,like,mention)
    // sourceUserId
    // sourcepostID
    // content
    // isRead

    type: {
        type: String,
        required: true
    },
    sourceUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    sourcePostId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    content: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    }   
})

export const Notification = mongoose.model("Notification", NotificationSchema);
import { Schema } from "mongoose";

const MessagesSchema = new Schema({
    //     id
    // content
    // attachments
    // sender-id
    // receiver-id
    // is_read
    content: {
        type: String,
        required: true
    },
    attachements: {
        type: [String],
        default: [],
        trim: true,
        required: false
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Messages = mongoose.model("Message", MessagesSchema);
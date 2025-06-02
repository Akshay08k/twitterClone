import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/index.js";
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    receiverUserId: req.user._id,
    isHidden: false,
  })
    .populate("sourceUserId", "username name avatar userHandle")
    .populate("sourcePostId")
    .sort({ createdAt: -1 });

  res.status(200).json(notifications);
});

export { getNotifications };

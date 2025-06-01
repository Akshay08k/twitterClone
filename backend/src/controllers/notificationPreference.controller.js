import NotificationPreference from "../Models/notificationPreference.model.js";

export const getNotificationSettings = async (req, res) => {
  const userId = req.user.id;
  try {
    const settings = await NotificationPreference.findOne({ userId });
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateNotificationSettings = async (req, res) => {
  const userId = req.user.id;
  const updatedSettings = req.body;
  try {
    const settings = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updatedSettings },
      { new: true, upsert: true }
    );
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

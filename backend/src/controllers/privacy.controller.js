// controllers/privacyController.js
import { PrivacySettings } from "../models/privacy.model.js";

export const getPrivacySettings = async (req, res) => {
  const userId = req.user.id;
  try {
    const settings = await PrivacySettings.findOne({ userId });
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updatePrivacySettings = async (req, res) => {
  const userId = req.user.id;
  const updatedSettings = req.body;
  try {
    const settings = await PrivacySettings.findOneAndUpdate(
      { userId },
      { $set: updatedSettings },
      { new: true, upsert: true }
    );
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

import axios from "../contexts/axios"; // Your existing axios instance

export const settingsAPI = {
  // Profile Settings
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put("/user/profile", profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadProfilePicture: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", imageFile);
      const response = await axios.post("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Privacy Settings
  updatePrivacySettings: async (privacyData) => {
    try {
      const response = await axios.put("/user/privacy", privacyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPrivacySettings: async () => {
    try {
      const response = await axios.get("/user/privacy");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Notification Settings
  updateNotificationSettings: async (notificationData) => {
    try {
      const response = await axios.put("/user/notifications", notificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getNotificationSettings: async () => {
    try {
      const response = await axios.get("/user/notifications");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Account Settings
  changePassword: async (passwordData) => {
    try {
      const response = await axios.put("/user/password", passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadUserData: async () => {
    try {
      const response = await axios.get("/user/export", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "my-data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deactivateAccount: async () => {
    try {
      const response = await axios.put("/user/deactivate");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await axios.delete("/user/account");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Blocked Users
  getBlockedUsers: async () => {
    try {
      const response = await axios.get("/user/blocked");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      const response = await axios.post(`/user/block/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await axios.delete(`/user/block/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

//profileSettings.jsx

// Add this import at the top
import { settingsAPI } from "../../api/settingsApi";

// Update the handleSubmit function in ProfileSettings component:
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await settingsAPI.updateProfile(formData);
    // Show success message
    console.log("Profile updated successfully");
  } catch (error) {
    console.error("Error updating profile:", error);
    // Show error message
  } finally {
    setIsLoading(false);
  }
};

// Add image upload handler
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      setIsLoading(true);
      await settingsAPI.uploadProfilePicture(file);
      // Update Redux state or refetch user data
      console.log("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  }
};

//useSettings.jsx

import { useState, useEffect } from "react";
import { settingsAPI } from "../api/settingsApi";

export const usePrivacySettings = () => {
  const [settings, setSettings] = useState({
    privateAccount: false,
    allowTagging: true,
    allowMentions: true,
    showFollowers: true,
    allowDirectMessages: true,
    photoTagging: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.getPrivacySettings();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await settingsAPI.updatePrivacySettings(newSettings);
      setSettings(newSettings);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState({
    likes: true,
    retweets: true,
    follows: true,
    mentions: true,
    directMessages: true,
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.getNotificationSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await settingsAPI.updateNotificationSettings(newSettings);
      setSettings(newSettings);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};

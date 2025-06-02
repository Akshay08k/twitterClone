import React, { useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { Heart, Repeat, UserPlus, AtSign, Mail } from "lucide-react";
import axios from "../../contexts/axios";
import toast, { Toaster } from "react-hot-toast";

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    likes: false,
    retweets: false,
    follows: false,
    mentions: false,
    directMessages: false,
    emailNotifications: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/notification_preference/fetch");
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notification settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const responce = await axios.post(
        "/notification_preference/update",
        notifications
      );
      if (responce.status == 200) {
        toast.success("Notification settings updated successfully");
      } else {
        toast.error("Failed to update notification settings");
      }
    } catch (err) {
      console.error("Failed to update notification settings:", err);
    }
  };

  const notificationOptions = [
    {
      category: "Activity Notifications",
      options: [
        {
          key: "likes",
          title: "Likes",
          description: "When someone likes your tweets",
          icon: Heart,
          value: notifications.likes,
        },
        {
          key: "retweets",
          title: "Retweets",
          description: "When someone retweets your content",
          icon: Repeat,
          value: notifications.retweets,
        },
        {
          key: "follows",
          title: "New Followers",
          description:
            "When someone starts following you or requests to follow",
          icon: UserPlus,
          value: notifications.follows,
        },
        {
          key: "mentions",
          title: "Mentions",
          description: "When someone mentions you in a tweet",
          icon: AtSign,
          value: notifications.mentions,
        },
        {
          key: "directMessages",
          title: "Direct Messages",
          description: "When you receive a direct message",
          icon: Mail,
          value: notifications.directMessages,
        },
      ],
    },
    {
      category: "Notification Settings",
      options: [
        {
          key: "emailNotifications",
          title: "Email Notifications",
          description: "Receive notifications via email",
          icon: Mail,
          value: notifications.emailNotifications,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <Toaster />
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Notification Settings
        </h2>
        <p className="text-gray-400">
          Choose what notifications you want to receive and how.
        </p>
      </div>

      {notificationOptions.map((section) => (
        <div
          key={section.category}
          className="bg-black-900 rounded-lg border border-gray-800"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              {section.category}
            </h3>

            <div className="space-y-4">
              {section.options.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.key}
                    className="flex items-center justify-between p-4 bg-black-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-black-700 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          {option.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <ToggleSwitch
                      value={option.value}
                      onChange={(value) =>
                        handleNotificationChange(option.key, value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;

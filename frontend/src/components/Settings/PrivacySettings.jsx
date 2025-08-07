import React, { useEffect, useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import axios from "../../contexts/axios";
import { Shield, Eye, Users, MessageSquare } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
const PrivacySettings = () => {
  const [privacySettings, setPrivacySettings] = useState({});

  const handleSettingChange = (key, value) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/privacy/fetch");
        setPrivacySettings(res.data);
      } catch (err) {
        console.error("Failed to fetch privacy settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const privacyOptions = [
    {
      key: "privateAccount",
      title: "Private Account",
      description: "Only approved followers can see your tweets and profile",
      icon: Shield,
      value: privacySettings.privateAccount,
    },

    {
      key: "allowMentions",
      title: "Allow Mentions",
      description: "Anyone can mention you in their tweets",
      icon: MessageSquare,
      value: privacySettings.allowMentions,
    },
    {
      key: "showFollowers",
      title: "Show Followers List",
      description: "Make your followers and following lists visible to others",
      icon: Eye,
      value: privacySettings.showFollowers,
    },
    {
      key: "allowDirectMessages",
      title: "Allow Direct Messages",
      description: "Anyone can send you direct messages",
      icon: MessageSquare,
      value: privacySettings.allowDirectMessages,
    },
  ];

  const handleSave = async () => {
    try {
      const responce = await axios.post("/privacy/update", privacySettings);
      if (responce.status == 200) {
        toast.success("Privacy settings updated successfully");
      } else {
        toast.error("Failed to update privacy settings");
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
    }
  };

  return (
    <div className="space-y-8">
      <Toaster />
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Privacy & Safety</h2>
        <p className="text-gray-400">
          Control who can see your content and interact with you.
        </p>
      </div>

      <div className="bg-black-900 rounded-lg border border-gray-800">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Privacy Controls
          </h3>

          <div className="space-y-6">
            {privacyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.key}
                  className="flex items-start justify-between p-4 bg-black-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-black-700 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
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
                    onChange={(value) => handleSettingChange(option.key, value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Blocked Users <span className="text-red-500">(COMING SOON)</span>
          </h3>
          <p className="text-gray-400 mb-4">Manage users you've blocked</p>

          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors">
            View Blocked Users
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Save Privacy Settings
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;

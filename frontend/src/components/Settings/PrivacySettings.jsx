import React, { useEffect, useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import axios from "../../contexts/axios";
import { Shield, Eye, Users, MessageSquare, UserX, X, UserCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

const PrivacySettings = () => {
  const [privacySettings, setPrivacySettings] = useState({});
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [unblockingId, setUnblockingId] = useState(null);

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

  const openBlockedModal = async () => {
    setShowBlockedModal(true);
    setLoadingBlocked(true);
    try {
      const res = await axios.get("/user/blocked");
      setBlockedUsers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
      toast.error("Failed to load blocked users");
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (userId, username) => {
    setUnblockingId(userId);
    try {
      await axios.post(`/user/unblock/${userId}`);
      setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success(`Unblocked @${username}`);
    } catch (err) {
      console.error("Failed to unblock:", err);
      toast.error("Failed to unblock user");
    } finally {
      setUnblockingId(null);
    }
  };

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
      const response = await axios.post("/privacy/update", privacySettings);
      if (response.status === 200) {
        toast.success("Privacy settings updated successfully");
      } else {
        toast.error("Failed to update privacy settings");
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast.error("Failed to update privacy settings");
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

      <div className="bg-[#16181c] rounded-2xl border border-[#24272c] overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Privacy Controls
          </h3>

          <div className="space-y-4">
            {privacyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.key}
                  className="flex items-start justify-between p-4 bg-black/40 rounded-xl border border-[#24272c]"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-[#24272c] rounded-lg">
                      <Icon className="h-5 w-5 text-[#1d9bf0]" />
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

        {/* Blocked Users Section */}
        <div className="border-t border-[#24272c] p-6">
          <div className="flex items-center space-x-3 mb-2">
            <UserX className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-white">Blocked Users</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Manage users you have blocked. Blocked users cannot follow you, view your posts, or message you.
          </p>

          <button
            onClick={openBlockedModal}
            className="px-5 py-2.5 bg-black hover:bg-white/10 text-white rounded-full border border-[#24272c] text-sm font-semibold transition-colors"
          >
            Manage Blocked Users
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full transition-colors active:scale-95"
        >
          Save Privacy Settings
        </button>
      </div>

      {/* Blocked Users Modal */}
      {showBlockedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowBlockedModal(false)}
        >
          <div
            className="bg-black border border-[#24272c] rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-modal overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#24272c]">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">Blocked Accounts</h3>
              </div>
              <button
                onClick={() => setShowBlockedModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto divide-y divide-[#24272c]/50 flex-1">
              {loadingBlocked ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#1d9bf0] border-t-transparent"></div>
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <UserCheck className="w-10 h-10 text-gray-600 mx-auto" />
                  <p className="text-white font-bold text-base">No Blocked Accounts</p>
                  <p className="text-gray-500 text-xs">
                    You haven't blocked anyone yet. When you block someone, they will appear here.
                  </p>
                </div>
              ) : (
                blockedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-[#16181c] rounded-xl transition-colors"
                  >
                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setShowBlockedModal(false)}
                      className="flex items-center space-x-3 min-w-0 flex-1 mr-3"
                    >
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border border-[#24272c]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-sm truncate hover:underline">
                          {user.username}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          @{user.userHandle || user.username}
                        </p>
                        {user.bio && (
                          <p className="text-gray-400 text-xs truncate mt-0.5">{user.bio}</p>
                        )}
                      </div>
                    </Link>

                    <button
                      onClick={() => handleUnblock(user._id, user.username)}
                      disabled={unblockingId === user._id}
                      className="px-4 py-1.5 rounded-full text-xs font-bold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all shrink-0 active:scale-95"
                    >
                      {unblockingId === user._id ? "Unblocking..." : "Unblock"}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#24272c] bg-[#16181c]/50 flex justify-end">
              <button
                onClick={() => setShowBlockedModal(false)}
                className="px-5 py-1.5 bg-white text-black hover:bg-gray-200 text-xs font-bold rounded-full transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;

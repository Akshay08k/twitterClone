import React, { useEffect, useState } from "react";
import axios from "../../contexts/axios";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  AtSign,
  Settings,
  BellOffIcon,
} from "lucide-react";

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-6 h-6 text-red-500 fill-current" />;
      case "retweet":
        return <Repeat2 className="w-6 h-6 text-green-500" />;
      case "follow":
        return <UserPlus className="w-6 h-6 text-blue-500" />;
      case "mention":
        return <AtSign className="w-6 h-6 text-purple-500" />;
      default:
        return <MessageCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/notification/fetch");

        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    return notification.type === activeTab;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-opacity-80 bg-black">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <button className="p-2 rounded-full hover:bg-gray-800">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex">
          {["all", "like", "retweet", "follow", "mention"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "all" && (
                <span className="ml-2 text-sm opacity-70">
                  ({notifications.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-1">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-black  rounded-2xl p-4 relative shadow-md hover:bg-[#1a1a1a] transition-colors"
            >
              {!notification.is_read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={
                        notification.sourceUserId?.avatar ||
                        "https://ui-avatars.com/api/?name=User&background=333333&color=ffffff"
                      }
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-bold block">
                        {notification.sourceUserId?.username || "user"}
                      </span>
                      <span className="text-sm text-gray-400 block">
                        @{notification.sourceUserId?.userHandle || "unknown"}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">{notification.content}</p>
                  {console.log(notification.sourcePostId)}
                  {notification.sourcePostId && (
                    <div className="bg-black rounded-lg p-3 text-sm border-gray-100 border border-opacity-15">
                      <p className="text-gray-300">
                        {notification.sourcePostId.description.slice(0, 15)}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <BellOffIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
            <p className="text-gray-400">
              When someone interacts with your tweets, you'll see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;

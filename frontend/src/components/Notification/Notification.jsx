import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  AtSign,
  Settings,
} from "lucide-react";

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const notifications = [
    {
      id: 1,
      type: "like",
      user: { name: "Sarah Johnson", username: "sarahj_dev", avatar: "👩‍💻" },
      content: "liked your tweet",
      tweet: "Just shipped a new feature! 🚀 #coding #webdev",
      time: "2m",
      isNew: true,
    },
    {
      id: 2,
      type: "follow",
      user: { name: "Alex Chen", username: "alexchen_ui", avatar: "👨‍🎨" },
      content: "started following you",
      time: "5m",
      isNew: true,
    },
    {
      id: 3,
      type: "retweet",
      user: { name: "Mike Wilson", username: "mikew_tech", avatar: "👨‍💼" },
      content: "retweeted your tweet",
      tweet: "React hooks are game changers for state management 💯",
      time: "15m",
      isNew: false,
    },
    {
      id: 4,
      type: "mention",
      user: { name: "Emma Davis", username: "emma_codes", avatar: "👩‍🔬" },
      content: "mentioned you in a tweet",
      tweet: "Great article by @yourhandle about modern JavaScript patterns!",
      time: "1h",
      isNew: false,
    },
    {
      id: 5,
      type: "like",
      user: { name: "David Park", username: "davidp_design", avatar: "👨‍🎨" },
      content: "liked your tweet",
      tweet:
        "Clean code is not just about functionality, its about readability too 📚",
      time: "2h",
      isNew: false,
    },
    {
      id: 6,
      type: "follow",
      user: { name: "Lisa Zhang", username: "lisa_frontend", avatar: "👩‍💻" },
      content: "started following you",
      time: "3h",
      isNew: false,
    },
    {
      id: 7,
      type: "retweet",
      user: { name: "James Rodriguez", username: "jamesrod_js", avatar: "👨‍💻" },
      content: "retweeted your tweet",
      tweet: "TypeScript makes JavaScript development so much better! 🔥",
      time: "5h",
      isNew: false,
    },
    {
      id: 8,
      type: "mention",
      user: { name: "Ana Silva", username: "ana_webdev", avatar: "👩‍💼" },
      content: "mentioned you in a tweet",
      tweet:
        "Thanks to @yourhandle for the awesome tutorial on React components!",
      time: "1d",
      isNew: false,
    },
  ];

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

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    return notification.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-opacity-80 bg-black">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-800">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
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
      </div>

      {/* Notifications List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-1">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-black rounded-lg p-4 transition-all duration-200 cursor-pointer relative"
            >
              {notification.isNew && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{notification.user.avatar}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">
                        {notification.user.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        @{notification.user.username}
                      </span>
                      <span className="text-sm text-gray-400">
                        • {notification.time}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-2">{notification.content}</p>

                  {notification.tweet && (
                    <div className="bg-black-800 border border-gray-100 border-opacity-20 rounded-lg p-3 text-sm">
                      <p className="text-gray-300">"{notification.tweet}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
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

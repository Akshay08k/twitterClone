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

// Helpers
const getNotificationIcon = (type) => {
  switch (type) {
    case "like":
      return <Heart className="w-6 h-6 text-red-500 fill-current" />;
    case "follow":
      return <UserPlus className="w-6 h-6 text-blue-500" />;
    case "mention":
      return <AtSign className="w-6 h-6 text-purple-500" />;
    case "follow_request":
      return <UserPlus className="w-6 h-6 text-yellow-500" />;
    default:
      return <MessageCircle className="w-6 h-6 text-gray-500" />;
  }
};

const getTabIcon = (tab) => {
  switch (tab) {
    case "all":
      return <MessageCircle className="w-5 h-5" />;
    case "like":
      return <Heart className="w-5 h-5 text-red-500" />;
    case "request":
      return <UserPlus className="w-5 h-5 text-yellow-500" />;
    case "follow":
      return <Repeat2 className="w-5 h-5 text-blue-500" />;
    case "mention":
      return <AtSign className="w-5 h-5 text-purple-500" />;
    default:
      return null;
  }
};

const getAvatar = (user) =>
  user?.avatar ||
  "https://ui-avatars.com/api/?name=User&background=333&color=fff";

const truncate = (text = "", len = 50) =>
  text.length > len ? `${text.slice(0, len)}...` : text;

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [notiRes, reqRes] = await Promise.all([
        axios.get("/notification/fetch"),
        axios.get("/follow_request/pending"),
      ]);
      setNotifications(notiRes.data);
      setFollowRequests(reqRes.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const normalizedNotifications = () => {
    const requestNotis = followRequests.map((req) => ({
      _id: req._id,
      type: "follow_request",
      is_read: false,
      sourceUserId: req.from,
      content: `${req.from.username} sent you a follow request`,
    }));
    return [...notifications, ...requestNotis];
  };

  const allNotifications = normalizedNotifications();

  const filteredNotifications =
    activeTab === "request"
      ? allNotifications.filter((n) => n.type === "follow_request")
      : activeTab === "all"
      ? allNotifications
      : allNotifications.filter((n) => n.type === activeTab);

  const handleAcceptRequest = async (requestId, userId) => {
    try {
      await axios.post(`/follow_request/accept/${userId}`);
      setFollowRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const handleDeleteRequest = async (requestId, userId) => {
    try {
      await axios.delete(`/follow_request/delete/${userId}`);
      setFollowRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Failed to delete request", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
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
            <button
              className="p-2 rounded-full hover:bg-gray-800"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex space-x-4">
          {["all", "like", "request", "follow", "mention"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors rounded-full ${
                activeTab === tab
                  ? "text-blue-400 bg-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`}
              aria-label={tab}
            >
              {getTabIcon(tab)}
              <span className="capitalize">{tab}</span>
              {tab === "all" && (
                <span className="ml-1 text-xs opacity-70">
                  ({notifications.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {console.log(notifications)}
      {/* Notifications List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-black rounded-2xl p-4 relative shadow-md hover:bg-[#1a1a1a] transition-colors"
            >
              {!notification.is_read &&
                notification.type !== "follow_request" && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={getAvatar(notification.sourceUserId)}
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

                  {notification.sourcePostId && (
                    <div className="bg-black rounded-lg p-3 text-sm border border-gray-100 border-opacity-15">
                      <p className="text-gray-300">
                        {truncate(notification.sourcePostId.description, 50)}
                      </p>
                    </div>
                  )}

                  {notification.type === "follow_request" && (
                    <div className="flex gap-4 mt-3">
                      <button
                        onClick={() =>
                          handleAcceptRequest(
                            notification._id,
                            notification.sourceUserId?._id
                          )
                        }
                        className="bg-blue-600 text-white px-4 py-1 rounded-full hover:bg-blue-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteRequest(
                            notification._id,
                            notification.sourceUserId?._id
                          )
                        }
                        className="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700"
                      >
                        Delete
                      </button>
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

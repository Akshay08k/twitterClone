import React, { useEffect, useState } from "react";
import axios from "../../contexts/axios";
import { Search, MailPlus, Settings, X, User } from "lucide-react";
import { useSelector } from "react-redux";

const formatConversationTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Sidebar = ({ activeChat, setActiveChat, setSelectedUser }) => {
  const reduxUser = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Fetch past conversations
  const fetchConversations = async () => {
    if (!reduxUser?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(`/message/conversations/${reduxUser._id}`);
      if (Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
      // Fallback to /message/users
      try {
        const usersRes = await axios.get("/message/users");
        setConversations(usersRes.data || []);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [reduxUser?._id]);

  // Live user search when typing in search bar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await axios.get(`/user/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchResults(res.data?.data || []);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectUser = (user) => {
    setActiveChat(user._id);
    setSelectedUser(user);
    setSearchTerm("");
    setIsNewChatModalOpen(false);

    // If not in conversations list yet, prepend it
    setConversations((prev) => {
      if (prev.some((c) => c._id === user._id)) return prev;
      return [user, ...prev];
    });
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.username?.toLowerCase() || "";
    const handle = c.userHandle?.toLowerCase() || "";
    const q = searchTerm.toLowerCase();
    return name.includes(q) || handle.includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-black select-none">
      {/* Top Header */}
      <div className="p-3 border-b border-[#24272c] flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="New message"
          >
            <MailPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#24272c]/40">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#1d9bf0]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search Direct Messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#16181c] text-white text-sm rounded-full pl-10 pr-8 py-2 border border-transparent focus:border-[#1d9bf0] focus:bg-black focus:outline-none transition-all placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations / Search Results List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#24272c]/30">
        {searchTerm.trim() ? (
          <div>
            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Search Results
            </div>
            {isSearchingUsers ? (
              <div className="p-6 text-center text-gray-500 text-xs">Searching users...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">No users found</div>
            ) : (
              searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className="px-4 py-3 flex items-center space-x-3 hover:bg-[#16181c] cursor-pointer transition-colors"
                >
                  <img
                    src={u.avatar || "/default-avatar.png"}
                    alt={u.username}
                    className="w-10 h-10 rounded-full object-cover border border-[#24272c]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{u.username}</p>
                    <p className="text-gray-500 text-xs truncate">@{u.userHandle || u.username}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-11 h-11 bg-[#16181c] rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#16181c] rounded w-3/5" />
                  <div className="h-3 bg-[#16181c] rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-white font-bold text-base">Welcome to your inbox!</p>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">
              Drop a line, share posts and more with private conversations between you and others on Twitty.
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
            >
              Write a message
            </button>
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = activeChat === chat._id;
            return (
              <div
                key={chat._id}
                onClick={() => handleSelectUser(chat)}
                className={`px-4 py-3 flex items-center space-x-3 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#16181c] border-r-2 border-[#1d9bf0]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <img
                  src={chat.avatar || "/default-avatar.png"}
                  alt={chat.username}
                  className="w-11 h-11 rounded-full object-cover border border-[#24272c] shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-white text-sm truncate">{chat.username}</p>
                    {chat.lastMessageTime && (
                      <span className="text-[11px] text-gray-500 shrink-0 ml-1">
                        {formatConversationTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-xs truncate">
                    @{chat.userHandle || chat.username}
                  </p>

                  {chat.lastMessage && (
                    <p className="text-gray-400 text-xs truncate mt-0.5">
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Message Modal Dialog */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-black border border-[#24272c] w-full max-w-md rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#24272c]">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-white text-base">New message</h3>
              </div>
            </div>

            <div className="p-3 border-b border-[#24272c]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#16181c] text-white text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#1d9bf0] border border-transparent placeholder-gray-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[#24272c]/30">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs">
                  {searchTerm ? "No users found" : "Type a username or handle to find people"}
                </div>
              ) : (
                searchResults.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className="px-4 py-3 flex items-center space-x-3 hover:bg-[#16181c] cursor-pointer transition-colors"
                  >
                    <img
                      src={u.avatar || "/default-avatar.png"}
                      alt={u.username}
                      className="w-10 h-10 rounded-full object-cover border border-[#24272c]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{u.username}</p>
                      <p className="text-gray-500 text-xs truncate">@{u.userHandle || u.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

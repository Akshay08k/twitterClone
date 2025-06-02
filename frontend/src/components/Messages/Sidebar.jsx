import { useEffect, useState } from "react";
import axios from "../../contexts/axios";

const Sidebar = ({ activeChat, setActiveChat, setSelectedUser }) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get("/message/users");
        setChats(res.data);
      } catch (err) {
        console.error("Failed to load chats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (chat) => {
    setActiveChat(chat._id);
    setSelectedUser(chat);
  };

  const filteredChats = chats.filter((chat) =>
    chat.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700/50 text-white placeholder-gray-400 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>No conversations found</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => handleChatClick(chat)}
              className={`group flex items-center p-4 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/30 ${
                activeChat === chat._id
                  ? "bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-r-2 border-blue-500 shadow-lg"
                  : ""
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={chat.username}
                  className="w-14 h-14 rounded-full ring-2 ring-gray-700/50 group-hover:ring-blue-500/30 transition-all duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>

              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors duration-200">
                    {chat.username}
                  </p>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {chat.lastMessageTime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm truncate pr-2">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;

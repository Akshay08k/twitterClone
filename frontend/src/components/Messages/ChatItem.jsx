import React from "react";

const ChatItem = ({ chat, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`group flex items-center p-4 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/30 ${
      isActive
        ? "bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-r-2 border-blue-500 shadow-lg"
        : ""
    }`}
  >
    <div className="relative">
      <img
        src={chat.avatar}
        alt={chat.name}
        className="w-14 h-14 rounded-full ring-2 ring-gray-700/50 group-hover:ring-blue-500/30 transition-all duration-300"
      />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
    </div>

    <div className="ml-4 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors duration-200">
          {chat.name}
        </p>
        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
          {chat.time}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm truncate pr-2">
          {chat.lastMessage}
        </p>
        {chat.unread > 0 && (
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs rounded-full px-2.5 py-1 ml-2 font-medium shadow-lg animate-pulse">
            {chat.unread > 99 ? "99+" : chat.unread}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default ChatItem;

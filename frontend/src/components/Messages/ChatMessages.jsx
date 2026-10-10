import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatMessages = ({ messages, activeChat, selectedUser }) => {
  const chatRef = useRef(null);
  const reduxUser = useSelector((state) => state.user);
  const myId = reduxUser?._id;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const isOwnMessage = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return senderId?.toString() === myId?.toString();
  };

  return (
    <div
      ref={chatRef}
      className="h-full px-4 py-6 overflow-y-auto space-y-4 bg-black select-text"
    >
      {/* Top Profile Summary Card (Matches Twitter DM screen) */}
      {selectedUser && (
        <div className="flex flex-col items-center text-center py-6 border-b border-[#24272c]/40 mb-6 space-y-2">
          <Link to={`/profile/${selectedUser.username}`} className="group">
            <img
              src={selectedUser.avatar || "/default-avatar.png"}
              alt={selectedUser.username}
              className="w-16 h-16 rounded-full object-cover border border-[#24272c] group-hover:opacity-90 transition-opacity"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${selectedUser.username}`}
              className="font-extrabold text-white text-base hover:underline block"
            >
              {selectedUser.username}
            </Link>
            <p className="text-gray-500 text-xs">
              @{selectedUser.userHandle || selectedUser.username}
            </p>
          </div>
          {selectedUser.bio && (
            <p className="text-gray-400 text-xs max-w-xs">{selectedUser.bio}</p>
          )}
          <Link
            to={`/profile/${selectedUser.username}`}
            className="text-xs font-semibold text-[#1d9bf0] hover:underline pt-1 inline-block"
          >
            View profile
          </Link>
        </div>
      )}

      {/* Messages Stream */}
      {messages.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-xs">
          Say hello to start the conversation!
        </div>
      ) : (
        messages.map((msg, index) => {
          const isMine = isOwnMessage(msg);
          return (
            <div
              key={msg._id || index}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"} animate-fadeIn`}
            >
              <div
                className={`max-w-[78%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                  isMine
                    ? "bg-[#1d9bf0] text-white rounded-br-sm"
                    : "bg-[#202327] text-white rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Message Timestamp */}
              <span className="text-[10px] text-gray-500 mt-1 px-1">
                {formatMessageTime(msg.createdAt)}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatMessages;

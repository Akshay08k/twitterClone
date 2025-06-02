import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../contexts/axios";
import socket from "../../utils/socket";

const MessageInput = ({ activeChat }) => {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const reduxUser = useSelector((state) => state.user);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await axios.post("/message/send", {
        content,
        sender: reduxUser._id,
        receiver: activeChat,
      });

      socket.emit("sendMessage", res.data);
      setContent("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/20"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSending}
            className="w-full rounded-full px-6 py-3 bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isSending}
          className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;

import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../contexts/axios";
import socket from "../../utils/socket";
import { Image, Smile, Send } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = ({ activeChat, onNewMessage }) => {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const reduxUser = useSelector((state) => state.user);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSending || !activeChat) return;

    const messageText = content.trim();
    setIsSending(true);

    try {
      const res = await axios.post("/message/send", {
        content: messageText,
        sender: reduxUser._id,
        receiver: activeChat,
      });

      const savedMessage = res.data;
      if (onNewMessage) onNewMessage(savedMessage);
      socket.emit("sendMessage", savedMessage);
      setContent("");
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-3 bg-black/90 backdrop-blur-md border-t border-[#24272c]"
    >
      <div className="flex items-center space-x-2 bg-[#16181c] border border-[#24272c] rounded-3xl px-3 py-1.5 focus-within:border-[#1d9bf0] transition-colors">
        {/* Media / Image Icon */}
        <button
          type="button"
          onClick={() => toast("Image upload in DMs coming soon!", { icon: "🖼️" })}
          className="p-1.5 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors shrink-0"
          title="Add photo"
        >
          <Image className="w-5 h-5" />
        </button>

        {/* Emoji Icon */}
        <button
          type="button"
          onClick={() => toast("Emoji picker coming soon!", { icon: "😊" })}
          className="p-1.5 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition-colors shrink-0"
          title="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start a new message"
          disabled={isSending}
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none px-1 py-1"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!content.trim() || isSending}
          className="p-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-40 disabled:hover:bg-[#1d9bf0] text-white rounded-full transition-all shrink-0 active:scale-95"
          title="Send"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;

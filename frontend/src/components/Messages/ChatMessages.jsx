import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../contexts/axios";
import socket from "../../utils/socket";

const ChatMessages = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const reduxUser = useSelector((state) => state.user);
  const myId = reduxUser._id;

  // Fetch messages when activeChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/message/fetch/${activeChat}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeChat) {
      fetchMessages();
    }
  }, [activeChat]);

  // Listen to incoming socket messages
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      if (
        newMessage.sender._id === activeChat ||
        newMessage.receiver === activeChat
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [activeChat]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const isOwnMessage = (msg) => msg.sender._id === myId;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-black rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className="h-full px-4 py-6 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-900/20 to-black/40 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
    >
      {messages.map((msg, index) => (
        <div
          key={msg._id}
          className={`flex animate-fadeIn ${
            isOwnMessage(msg) ? "justify-end" : "justify-start"
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div
            className={`flex space-x-3 max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg ${
              isOwnMessage(msg) ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            {!isOwnMessage(msg) && (
              <img
                src={msg.sender.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full ring-2 ring-gray-600/30 flex-shrink-0"
              />
            )}
            <div className="flex flex-col space-y-1">
              <div
                className={`${
                  isOwnMessage(msg)
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25"
                    : "bg-gradient-to-r from-gray-700 to-gray-600 shadow-gray-700/25"
                } rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
              >
                <p className="text-sm leading-relaxed text-white">
                  {msg.content}
                </p>
              </div>
              <p
                className={`text-xs text-gray-500 px-2 ${
                  isOwnMessage(msg) ? "text-right" : "text-left"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;

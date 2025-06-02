import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import axios from "../../contexts/axios";
import socket from "../../utils/socket";

const MessagingPage = () => {
  const reduxUser = useSelector((state) => state.user);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!reduxUser?._id) return;

    socket.emit("joinRooms", reduxUser._id);

    return () => {
      socket.off("receiveMessage");
    };
  }, [reduxUser?._id]);

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
    if (!activeChat) {
      setSelectedUser(null);
      setMessages([]);
      return;
    }

    const fetchSelectedUser = async () => {
      try {
        const res = await axios.get("/message/users");
        const user = res.data.find((u) => u._id === activeChat);
        setSelectedUser(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/message/fetch/${activeChat}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    fetchSelectedUser();
    fetchMessages();
  }, [activeChat]);

  const handleNewMessage = async (messageData) => {
    try {
      const res = await axios.post("/message/send", messageData);
      const savedMessage = res.data;
      socket.emit("sendMessage", savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white mt-16 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] rounded-2xl overflow-hidden bg-black backdrop-blur-xl shadow-2xl">
        <div className="flex h-full">
          <div
            className={`${
              isMobileView && activeChat ? "hidden" : "flex"
            } w-full md:w-80 lg:w-96 flex-col border-r border-gray-700/50 bg-gradient-to-b from-gray-800/30 to-gray-900/30`}
          >
            <div className="p-4 border-b border-gray-700/50">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                setSelectedUser={setSelectedUser}
              />
            </div>
          </div>

          <div
            className={`${
              isMobileView && !activeChat ? "hidden" : "flex"
            } flex-1 flex-col`}
          >
            {activeChat && selectedUser ? (
              <>
              
                {isMobileView && (
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-4 hover:bg-gray-700/50 transition-colors duration-200 border-b border-gray-700/50"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                <ChatHeader user={selectedUser} />

                <div className="flex-1 overflow-hidden">
                  <ChatMessages messages={messages} activeChat={activeChat} />
                </div>

                <div className="border-t border-gray-700/50">
                  <MessageInput
                    activeChat={activeChat}
                    onNewMessage={handleNewMessage}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800/20 to-gray-900/40">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
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
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a chat from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;

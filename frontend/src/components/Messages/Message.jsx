import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import axios from "../../contexts/axios";
import socket from "../../utils/socket";
import { MailPlus } from "lucide-react";

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

  // Join user room for socket
  useEffect(() => {
    if (!reduxUser?._id) return;

    socket.emit("joinRooms", reduxUser._id);

    return () => {
      socket.off("receiveMessage");
    };
  }, [reduxUser?._id]);

  // Real-time message listener
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      const senderId = newMessage.sender?._id || newMessage.sender;
      const receiverId = newMessage.receiver?._id || newMessage.receiver;

      if (senderId === activeChat || receiverId === activeChat) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [activeChat]);

  // Fetch messages when activeChat changes
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/message/fetch/${activeChat}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    fetchMessages();
  }, [activeChat]);

  const handleNewMessage = (savedMessage) => {
    setMessages((prev) => [...prev, savedMessage]);
  };

  return (
    <div className="h-full w-full flex bg-black overflow-hidden select-none">
      {/* Left Pane: Conversations List */}
      <div
        className={`${
          isMobileView && activeChat ? "hidden" : "flex"
        } w-full md:w-[360px] lg:w-[390px] flex-col border-r border-[#24272c] h-full shrink-0`}
      >
        <Sidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          setSelectedUser={setSelectedUser}
        />
      </div>

      {/* Right Pane: Active Chat Conversation or Twitter Empty State */}
      <div
        className={`${
          isMobileView && !activeChat ? "hidden" : "flex"
        } flex-1 flex-col h-full bg-black min-w-0`}
      >
        {activeChat && selectedUser ? (
          <div className="flex flex-col h-full w-full">
            {/* Top Chat Header */}
            <ChatHeader
              user={selectedUser}
              onBack={() => setActiveChat(null)}
            />

            {/* Message Stream */}
            <div className="flex-1 overflow-hidden">
              <ChatMessages
                messages={messages}
                activeChat={activeChat}
                selectedUser={selectedUser}
              />
            </div>

            {/* Bottom Message Input Bar */}
            <MessageInput
              activeChat={activeChat}
              onNewMessage={handleNewMessage}
            />
          </div>
        ) : (
          /* Twitter Exact Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black">
            <div className="max-w-sm space-y-3">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Select a message
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Choose from your existing conversations, or start a new one to connect with people on Twitty.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;

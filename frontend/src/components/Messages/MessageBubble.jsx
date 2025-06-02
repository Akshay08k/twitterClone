import React from "react";

const MessageBubble = ({ message }) => (
  <div className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
    <div
      className={`flex space-x-3 max-w-xs lg:max-w-md ${
        message.sender === "me" ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {message.sender === "other" && (
        <img
          src={message.avatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}
      <div
        className={`${
          message.sender === "me" ? "bg-blue-600" : "bg-gray-800"
        } rounded-2xl px-4 py-2`}
      >
        <p className="text-sm">{message.text}</p>
        <p className="text-xs text-gray-400 mt-1">{message.time}</p>
      </div>
    </div>
  </div>
);

export default MessageBubble;

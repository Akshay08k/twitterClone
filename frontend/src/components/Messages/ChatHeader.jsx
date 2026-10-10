import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";

const ChatHeader = ({ user, onBack }) => {
  if (!user) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black/85 backdrop-blur-md border-b border-[#24272c] sticky top-0 z-10 select-none">
      <div className="flex items-center space-x-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <Link
          to={`/profile/${user.username}`}
          className="flex items-center space-x-3 min-w-0 group"
        >
          <img
            src={user.avatar || "/default-avatar.png"}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover border border-[#24272c]"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-white text-base leading-tight truncate group-hover:underline">
              {user.username}
            </h2>
            <p className="text-xs text-gray-500 truncate">
              @{user.userHandle || user.username}
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-1">
        <Link
          to={`/profile/${user.username}`}
          className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Conversation info"
        >
          <Info className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default ChatHeader;

import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const PostHeader = ({ user, createdAt }) => {
  return (
    <div className="flex items-center text-sm leading-5 space-x-1.5 min-w-0">
      <span className="font-bold text-white flex items-center space-x-0.5 truncate">
        <span>{user?.username || "User"}</span>
        {(user?.isVerified || user?.isPremium) && (
          <BadgeCheck
            className={`w-4 h-4 fill-current shrink-0 ml-0.5 ${
              user?.verifiedBadgeType === "gold" || user?.premiumTier === "premium_plus"
                ? "text-[#e2b714]"
                : "text-[#1d9bf0]"
            }`}
          />
        )}
      </span>
      <span className="text-gray-500 truncate">
        @{user?.userHandle?.toLowerCase() || user?.username?.toLowerCase()}
      </span>
      <span className="text-gray-500">·</span>
      <span className="text-gray-500 shrink-0 text-xs">
        {formatRelativeTime(createdAt)}
      </span>
    </div>
  );
};

export default PostHeader;

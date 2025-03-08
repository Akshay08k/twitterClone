import React from "react";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
const PostHeader = ({ user, createdAt }) => {
  return (
    <>
      <div className="flex items-center text-sm leading-5 space-x-1">
        <span className="font-bold text-white hover:underline">
          {user?.username}
        </span>
        <span className="text-gray-500">@{user?.username?.toLowerCase()}</span>
        <span className="text-gray-500">·</span>
        <span className="text-gray-500 hover:underline">
          {formatDate(createdAt)}
        </span>
      </div>
    </>
  );
};

export default PostHeader;

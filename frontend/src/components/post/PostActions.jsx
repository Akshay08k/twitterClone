import React from "react";

const PostActions = ({
  isLiked,
  isRetweeted,
  likesCount,
  commentsCount,
  retweetsCount,
  handleLike,
  handleRetweet,
  toggleComments,
}) => {
  return (
    <>
      <div className="flex justify-between mt-3 max-w-md">
        <button
          onClick={toggleComments}
          className="group flex items-center text-gray-500 hover:text-[#1d9bf0] transition-colors"
        >
          <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="ml-1 text-sm">{commentsCount}</span>
        </button>
        <button
          onClick={handleRetweet}
          className={`group flex items-center transition-colors ${
            isRetweeted
              ? "text-green-500"
              : "text-gray-500 hover:text-green-500"
          }`}
        >
          <div className="p-2 rounded-full group-hover:bg-green-500/10">
            <svg
              className="w-5 h-5"
              fill={isRetweeted ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
          <span className="ml-1 text-sm">{retweetsCount}</span>
        </button>
        <button
          onClick={handleLike}
          className={`group flex items-center transition-colors ${
            isLiked ? "text-pink-500" : "text-gray-500 hover:text-pink-500"
          }`}
        >
          <div className="p-2 rounded-full group-hover:bg-pink-500/10">
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="ml-1 text-sm">{likesCount}</span>
        </button>
      </div>
    </>
  );
};

export default PostActions;

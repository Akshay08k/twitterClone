// components/CommentThread.jsx
import React, { useState } from "react";
import axios from "axios";

const CommentThread = ({ comment, postId, onReplySubmit }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${postId}/comments/${comment._id}/reply`,
        { content: replyText },
        { withCredentials: true }
      );

      if (response.data.success) {
        setReplyText("");
        setShowReplyInput(false);
        setShowReplies(true);
        if (onReplySubmit) {
          onReplySubmit(response.data.comment);
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  return (
    <div className="relative">
      <div className="flex space-x-3 p-3 hover:bg-gray-900/40 rounded-lg transition-colors">
        {comment.replies?.length > 0 && (
          <div className="absolute left-7 top-12 bottom-0 w-0.5 bg-gray-800" />
        )}

        <img
          src={comment.user?.avatar || "/default-avatar.png"}
          alt={comment.user?.username}
          className="w-10 h-10 rounded-full"
        />

        <div className="flex-1">
          <div className="flex items-center text-sm space-x-1">
            <span className="font-bold text-white hover:underline">
              {comment.user?.username}
            </span>
            <span className="text-gray-500">
              @{comment.user?.username?.toLowerCase()}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          <p className="text-white mt-1 text-[15px]">{comment.content}</p>

          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-gray-500 hover:text-[#1d9bf0] text-sm flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
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
              <span>Reply</span>
            </button>

            {comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[#1d9bf0] text-sm hover:underline"
              >
                {showReplies
                  ? "Hide replies"
                  : `Show ${comment.replies.length} ${
                      comment.replies.length === 1 ? "reply" : "replies"
                    }`}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <div className="flex space-x-3">
                <img
                  src="/default-avatar.png"
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Post your reply"
                    className="w-full bg-transparent text-white text-sm resize-none focus:outline-none min-h-[60px]"
                    rows="2"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-2 text-[#1d9bf0]">
                      {/* Add media upload icons here if needed */}
                    </div>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className={`px-3 py-1 rounded-full font-bold text-sm
                        ${
                          replyText.trim()
                            ? "bg-[#1d9bf0] text-white hover:bg-[#1a91da]"
                            : "bg-[#1d9bf0]/50 text-white/50 cursor-not-allowed"
                        }`}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Nested Replies */}
          {showReplies && comment.replies?.length > 0 && (
            <div className="mt-2 space-y-1 pl-2">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  onReplySubmit={onReplySubmit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentThread;

// components/CommentComponent.jsx
import React, { useState } from "react";
import { formatDistance } from "date-fns";

const CommentComponent = ({ comment, onReply, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className={`ml-${depth * 4} border-l border-gray-800 pl-4 mb-3`}>
      <div className="flex space-x-3">
        <img
          src={comment.user?.avatar || "/default-avatar.png"}
          alt={comment.user?.username}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">
              {comment.user?.username}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDistance(new Date(comment.createdAt), new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-white mt-1">{comment.content}</p>

          <div className="mt-2 flex space-x-4">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-gray-500 hover:text-blue-500 text-sm"
            >
              Reply
            </button>
          </div>

          {showReplyInput && (
            <div className="mt-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg p-2 border border-gray-800"
                placeholder="Write your reply..."
              />
              <button
                onClick={handleSubmitReply}
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm"
              >
                Reply
              </button>
            </div>
          )}

          {comment.replies?.map((reply) => (
            <CommentComponent
              key={reply._id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;

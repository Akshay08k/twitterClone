import React, { useState, useEffect } from "react";
import axios from "axios";
import CommentThread from "./CommentThread";

const CommentSection = ({ postId, initialComments = [], onCommentUpdate }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const response = await axios.post(
        `http://localhost:3000/comment/${postId}/create`,
        { content: newComment, postId },
        { withCredentials: true }
      );

      if (response.data.success && response.data.comment?._id) {
        setComments((prev) => [response.data.comment, ...prev]); // Update state
        setNewComment(""); // Clear input field

        console.log("New Comment Added:", response.data.comment); // ✅ Debugging

        if (onCommentUpdate) {
          console.log("Triggering onCommentUpdate..."); // ✅ Check if it runs
          onCommentUpdate(response.data.comment);
        } else {
          console.error("onCommentUpdate is undefined!"); // 🚨 Debugging
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleReplySubmit = (newReply, parentCommentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === parentCommentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      )
    );
  };

  return (
    <div className="px-4 pb-4">
      <form
        onSubmit={handleCommentSubmit}
        className="mb-4 border-b border-gray-800 pb-4"
      >
        <div className="flex space-x-3">
          <img
            src="/default-avatar.png"
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post your reply"
              className="w-full bg-transparent text-white text-lg resize-none focus:outline-none min-h-[80px]"
              rows="3"
            />
            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`px-4 py-1.5 rounded-full font-bold text-sm
                  ${
                    newComment.trim()
                      ? "bg-[#1DA1F2] text-white hover:bg-[#1a91da]"
                      : "bg-[#1DA1F2]/50 text-white/50 cursor-not-allowed"
                  }`}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-1">
        {comments.map((comment) =>
          comment?._id ? (
            <CommentThread
              key={comment._id}
              comment={comment}
              postId={postId}
              onReplySubmit={(newReply) =>
                handleReplySubmit(newReply, comment._id)
              }
            />
          ) : null
        )}
      </div>
    </div>
  );
};

export default CommentSection;

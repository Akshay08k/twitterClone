import React, { useState, useEffect } from "react";
import axios from "axios";
import CommentThread from "./CommentThread";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);

  // Fetch comments for the post
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/comment/${postId}`,
        {
          withCredentials: true,
        }
      );

      // Filter to show only top-level comments (no parent)
      const topLevelComments = response.data.data.filter(
        (comment) => !comment.parentComment
      );

      setComments(topLevelComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to fetch comments");
    }
  };

  // Initial fetch of comments
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Create a new top-level comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/comment/${postId}/create`,
        {
          content: newComment,
          postId: postId,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const newCommentData = response.data.data;

        // Add new comment to the top of the comments list
        setComments((prevComments) => [newCommentData, ...prevComments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Failed to post comment");
    }
  };

  // Handle reply submission
  const handleReplySubmit = (newReply, parentCommentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }
        return comment;
      })
    );
  };

  // Handle comment deletion
  const handleDelete = (commentId) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment._id !== commentId)
    );
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="comment-section bg-black text-white p-4">
      {/* Comment Input */}
      <form
        onSubmit={handleCommentSubmit}
        className="mb-6 border-b border-gray-800 pb-4"
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
              placeholder="What's happening?"
              className="w-full bg-transparent text-white text-lg resize-none focus:outline-none min-h-[80px]"
              rows="3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`px-4 py-2 rounded-full font-bold text-sm ${
                  newComment.trim()
                    ? "bg-[#1d9bf0] text-white hover:bg-[#1a91da]"
                    : "bg-[#1d9bf0]/50 text-white/50 cursor-not-allowed"
                }`}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-gray-500 text-center">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              postId={postId}
              onReplySubmit={handleReplySubmit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;

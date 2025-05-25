import React, { useState, useEffect } from "react";
import axios from "../contexts/axios";
import CommentThread from "./CommentThread";
import { useSelector } from "react-redux";
import { buildCommentTree } from "../utils/buildCommentTree";

const CommentSection = ({ postId }) => {
  const user = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`comment/${postId}`);
      const nestedComments = buildCommentTree(response.data.data);
      setComments(nestedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to fetch comments");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

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
        const newCommentData = {
          ...response.data.data,
          replies: [],
          user: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
          },
        };
        setComments((prevComments) => [newCommentData, ...prevComments]);

        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Failed to post comment");
    }
  };

  const handleReplySubmit = (newReply, parentCommentId) => {
    const addReply = (comments) =>
      comments.map((comment) => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        } else if (comment.replies?.length > 0) {
          return {
            ...comment,
            replies: addReply(comment.replies),
          };
        }
        return comment;
      });

    setComments((prevComments) => addReply(prevComments));
  };

  const handleDelete = (commentId) => {
    const deleteComment = (comments) =>
      comments
        .filter((comment) => comment._id !== commentId)
        .map((comment) => ({
          ...comment,
          replies: deleteComment(comment.replies),
        }));

    setComments((prevComments) => deleteComment(prevComments));
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="comment-section bg-black text-white p-4">
      <form
        onSubmit={handleCommentSubmit}
        className="mb-6 border-b border-gray-800 pb-4"
      >
        <div className="flex space-x-3">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
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

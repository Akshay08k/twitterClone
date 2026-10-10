import React, { useState, useEffect } from "react";
import axios from "../contexts/axios";
import CommentThread from "./CommentThread";
import { useSelector } from "react-redux";
import { buildCommentTree } from "../utils/buildCommentTree";
import toast from "react-hot-toast";

const CommentSection = ({ postId, onCommentUpdate, onDelete }) => {
  const user = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`comment/${postId}`);
      const nestedComments = buildCommentTree(response.data?.data || []);
      setComments(nestedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/comment/${postId}/create`,
        {
          content: newComment.trim(),
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
        toast.success("Reply posted!");
        if (onCommentUpdate) onCommentUpdate(newCommentData);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = (newReply, parentCommentId) => {
    const addReply = (tree) =>
      tree.map((c) => {
        if (c._id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        } else if (c.replies?.length > 0) {
          return {
            ...c,
            replies: addReply(c.replies),
          };
        }
        return c;
      });

    setComments((prev) => addReply(prev));
    if (onCommentUpdate) onCommentUpdate(newReply);
  };

  const handleDelete = (commentId) => {
    const filterComments = (tree) =>
      tree
        .filter((c) => c._id !== commentId)
        .map((c) => ({
          ...c,
          replies: filterComments(c.replies || []),
        }));

    setComments((prev) => filterComments(prev));
    if (onDelete) onDelete(commentId);
  };

  return (
    <div className="pt-2 text-white">
      {/* Top Comment Composer */}
      <form
        onSubmit={handleCommentSubmit}
        className="mb-4 pb-3 border-b border-[#24272c]/50"
      >
        <div className="flex space-x-3">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt="Your avatar"
            className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 border border-[#24272c]"
          />
          <div className="flex-1 min-w-0">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post your reply"
              className="w-full bg-transparent text-white text-sm placeholder-gray-500 resize-none focus:outline-none min-h-[60px]"
              rows="2"
            />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold text-xs px-4 py-1.5 rounded-full transition-all"
              >
                {isSubmitting ? "Replying..." : "Reply"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment Thread List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1d9bf0] border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-xs text-center py-2">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500 text-xs text-center py-4">
          No replies yet. Be the first to reply!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              postId={postId}
              onReplySubmit={handleReplySubmit}
              onDelete={handleDelete}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;

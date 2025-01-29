// components/popups/CommentPopUp.jsx
import React, { useState } from "react";
import CommentComponent from "./commentComponent";
import axios from "axios";
const CommentPopup = ({ isOpen, onClose, post, onComment }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  console.log(post);
  const handleSubmitComment = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/comment/${post._id}/create`,
        { content: commentText },
        { withCredentials: true }
      );

      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setCommentText("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleReply = async (commentId, replyText) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${post._id}/comments/${commentId}/replies`,
        { content: replyText },
        { withCredentials: true }
      );

      if (response.data.success) {
        setComments(
          updateCommentsWithReply(comments, commentId, response.data.reply)
        );
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-black border border-gray-800 rounded-xl max-w-2xl mx-auto mt-20 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-gray-900 text-white rounded-lg p-2 border border-gray-800"
            placeholder="Write your comment..."
          />
          <button
            onClick={handleSubmitComment}
            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-full"
          >
            Comment
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {comments.map((comment) => (
            <CommentComponent
              key={comment._id}
              comment={comment}
              onReply={handleReply}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentPopup;

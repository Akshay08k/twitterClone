import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import CommentPopup from "./popups/CommentPopUp";

const SinglePost = () => {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [params.postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/posts/${params.postId}`,
        { withCredentials: true }
      );
      setPost(response.data.data);
      setIsLiked(!!response.data.data.userLiked);
      setLikesCount(response.data.data.postLikeCount);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch post");
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${params.postId}/like`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async (newComment) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${params.postId}/comments`,
        { content: newComment },
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchPost(); // Refresh post data to get updated comments
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading)
    return <div className="text-white text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!post)
    return <div className="text-white text-center p-4">Post not found</div>;

  return (
    <article className="border-b border-gray-800 p-4">
      <div className="flex space-x-3">
        <img
          src={post.user?.avatar || "/default-avatar.png"}
          alt={post.user?.username}
          className="w-12 h-12 rounded-full"
        />

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">{post.user?.username}</span>
            <span className="text-gray-500">
              @{post.user?.username?.toLowerCase()}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDate(post.post.createdAt)}
            </span>
          </div>

          <p className="mt-2 text-white whitespace-pre-wrap">
            {post.post.description}
          </p>

          {post.post.attachements && post.post.attachements.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden">
              <img
                src={post.post.attachements[0]}
                alt="Post attachment"
                className="max-h-96 w-full object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-3 max-w-md">
            <button
              onClick={() => setShowCommentPopup(true)}
              className="group flex items-center space-x-2 text-gray-500 hover:text-[#1DA1F2] transition-colors duration-200"
            >
              <div className="p-2 rounded-full group-hover:bg-[#1DA1F2] group-hover:bg-opacity-10">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <span>{post.postCommentsCount}</span>
            </button>

            <button className="group flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200">
              <div className="p-2 rounded-full group-hover:bg-green-500 group-hover:bg-opacity-10">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={handleLike}
              className={`group flex items-center space-x-2 ${
                isLiked ? "text-pink-500" : "text-gray-500 hover:text-pink-500"
              } transition-colors duration-200`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500 group-hover:bg-opacity-10">
                <svg
                  className="w-5 h-5"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span>{likesCount}</span>
            </button>

            <button className="group flex items-center space-x-2 text-gray-500 hover:text-[#1DA1F2] transition-colors duration-200">
              <div className="p-2 rounded-full group-hover:bg-[#1DA1F2] group-hover:bg-opacity-10">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {showCommentPopup && (
        <CommentPopup
          isOpen={showCommentPopup}
          onClose={() => setShowCommentPopup(false)}
          post={post}
          onComment={handleCommentSubmit}
        />
      )}
    </article>
  );
};

export default SinglePost;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CommentSection from "./CommentSection";
import { use } from "react";

const Post = React.forwardRef(({ post }, ref) => {
  const [isLiked, setIsLiked] = useState(post.userLiked);
  const [showComments, setShowComments] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(post.isRetweeted);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [retweetsCount, setRetweetsCount] = useState(post.retweetsCount || 0);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${post._id}/like`,
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

  const handleRetweet = async () => {};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleCommentUpdate = (newComment) => {
    console.log("New Comment Added:", newComment);
    setComments((prev) => [newComment, ...prev]); // Update the list of comments
    setCommentsCount((prev) => prev + 1); // Increase comment count
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/comment/${post._id}`,
          { withCredentials: true }
        );
        setComments(response.data.comments);
        setCommentsCount(response.data.commentsCount);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [post._id]);

  return (
    <div className="border-gray-800">
      <article
        ref={ref}
        className="px-4 pt-3 pb-2 hover:bg-gray-900/50 transition-colors duration-200 cursor-pointer"
      >
        <div className="flex">
          <div className="mr-3">
            <img
              src={post.user?.avatar || "/default-avatar.png"}
              alt={post.user?.username}
              className="w-11 h-11 rounded-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center text-sm leading-5 space-x-1">
              <span className="font-bold text-white hover:underline">
                {post.user?.username}
              </span>
              <span className="text-gray-500">
                @{post.user?.username?.toLowerCase()}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 hover:underline">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <Link to={`/posts/${post._id}`} className="block">
              <p className="text-white mt-1 text-[15px] whitespace-pre-wrap break-words">
                {post.description}
              </p>

              {post.attachements?.[0] && (
                <div className="mt-3 rounded-2xl overflow-hidden max-h-[510px] border border-gray-800">
                  <img
                    src={post.attachements[0]}
                    alt="Post attachment"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </Link>

            <div className="flex justify-between mt-3 max-w-md">
              <button
                onClick={() => setShowComments(!showComments)}
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
                  isLiked
                    ? "text-pink-500"
                    : "text-gray-500 hover:text-pink-500"
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
          </div>
        </div>
      </article>

      {showComments && (
        <CommentSection
          postId={post._id}
          initialComments={comments}
          onCommentUpdate={handleCommentUpdate}
        />
      )}
    </div>
  );
});

export default Post;

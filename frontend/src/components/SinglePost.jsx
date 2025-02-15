import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
} from "react-feather";
import { useParams } from "react-router-dom";

const SinglePost = () => {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    fetchPost();
  }, [params.postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/posts/post/${params.postId}`,
        { withCredentials: true }
      );
      setPost(response.data.data);
      setIsLiked(!!response.data.data.userLiked);
      setLikeCount(response.data.data.postLikeCount);
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
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/posts/${params.postId}/comments`,
        { content: commentContent },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCommentContent("");
        fetchPost(); // Refresh post data to get updated comments
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!post) return <div className="text-center p-4">Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      {/* Post Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.user?.avatar || "/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="font-bold dark:text-white">
              {post.user?.username || "User"}
            </h4>
            <span className="text-gray-500 text-sm">
              {format(new Date(post.post.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
          <MoreHorizontal size={20} className="dark:text-white" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-white mb-4">
          {post.post.description}
        </p>
        {post.post.attachements?.length > 0 && (
          <div className="rounded-xl overflow-hidden">
            <img
              src={post.post.attachements[0]}
              alt="Post attachment"
              className="w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <span>{likeCount} likes</span>
        <span className="mx-2">•</span>
        <span>{post.postCommentsCount} comments</span>
      </div>

      {/* Post Actions */}
      <div className="flex justify-between items-center border-y border-gray-200 dark:border-gray-700 py-2">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
            ${isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-400"}`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>

        <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
          <Share size={20} />
          <span>Share</span>
        </button>

        <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
          <Bookmark size={20} />
          <span>Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4">
          {/* Add Comment Input */}
          <form onSubmit={handleComment} className="flex gap-3 mb-4">
            <img
              src="/default-avatar.png"
              alt="Your avatar"
              className="w-8 h-8 rounded-full"
            />
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-full px-4 py-2"
            />
          </form>

          {/* Comments List */}
          {post.comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 mb-3">
              <img
                src="/default-avatar.png"
                alt="Commenter avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3">
                <div className="font-semibold dark:text-white">
                  {comment.user?.username || "User"}
                </div>
                <p className="text-gray-800 dark:text-gray-200">
                  {comment.content}
                </p>
                <div className="text-sm text-gray-500 mt-1">
                  {format(new Date(comment.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SinglePost;

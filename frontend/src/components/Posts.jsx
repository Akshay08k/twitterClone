import React, { useState } from "react";
import axios from "../contexts/axios";
import PostHeader from "./post/PostHeader";
import PostContent from "./post/PostContent";
import PostActions from "./post/PostActions";
import CommentSection from "./CommentSection";
import { Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Post = ({ post, editable = false }) => {
  const [isLiked, setIsLiked] = useState(post.userLiked);
  const [showComments, setShowComments] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(post.isRetweeted);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [retweetsCount, setRetweetsCount] = useState(post.retweetsCount || 0);

  const handleLike = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/like`);
      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/posts/${post._id}`);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleCommentUpdate = (newComment, deletedCommentId = null) => {
    if (deletedCommentId) {
      setComments((prev) =>
        prev.filter((comment) => comment._id !== deletedCommentId)
      );
      setCommentsCount((prev) => Math.max(prev - 1, 0));
    } else if (newComment) {
      setComments((prev) => [newComment, ...prev]);
      setCommentsCount((prev) => prev + 1);
    }
  };

  const handleCommentDelete = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    setCommentsCount((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="border-gray-800 border-t-4">
      <Toaster />
      <article className="px-4 pt-3 pb-2 hover:bg-gray-900/50 transition-colors duration-200 cursor-pointer">
        <div className="flex justify-between">
          <div className="flex">
            <div className="mr-3">
              <img
                src={
                  post.user.avatar ||
                  post.user.profileImage ||
                  "/default-avatar.png"
                }
                alt={post.user.username}
                className="w-11 h-11 rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <PostHeader user={post.user} createdAt={post.createdAt} />
              <PostContent post={post} />
              <PostActions
                isLiked={isLiked}
                isRetweeted={isRetweeted}
                likesCount={likesCount}
                commentsCount={commentsCount}
                retweetsCount={retweetsCount}
                handleLike={handleLike}
                handleRetweet={() => {}}
                toggleComments={() => setShowComments(!showComments)}
              />
            </div>
          </div>

          {editable && (
            <div className="space-x-2 mt-1 flex items-start">
              <button
                onClick={handleDelete}
                className="text-sm text-red-500 hover:underline"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </article>

      {showComments && (
        <CommentSection
          postId={post._id}
          initialComments={comments}
          onCommentUpdate={handleCommentUpdate}
          onDelete={handleCommentDelete}
        />
      )}
    </div>
  );
};

export default Post;

import React, { useState } from "react";
import axios from "axios";
import PostHeader from "./post/PostHeader";
import PostContent from "./post/PostContent";
import PostActions from "./post/PostActions";
import CommentSection from "./CommentSection";

const Post = ({ post }) => {
  // Removed ref if not needed
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

  const handleCommentUpdate = (newComment) => {
    // Add the new comment to the comments array
    setComments((prevComments) => [newComment, ...prevComments]);

    // Increment the comments count
    setCommentsCount((prev) => prev + 1);

    // For debugging
    console.log("Comment added:", newComment);
    console.log("New comment count:", commentsCount + 1);
  };

  return (
    <div className="border-gray-800">
      <article className="px-4 pt-3 pb-2 hover:bg-gray-900/50 transition-colors duration-200 cursor-pointer">
        <div className="flex">
          <div className="mr-3">
            <img
              src={post.user?.avatar || "/default-avatar.png"}
              alt={post.user?.username}
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
};

export default Post;

import React, { useState } from "react";
import { MessageCircle, Repeat2, Heart, Bookmark, Share } from "lucide-react";

const PostActions = ({
  isLiked,
  isRetweeted,
  isBookmarked,
  likesCount,
  commentsCount,
  retweetsCount,
  handleLike,
  handleRetweet,
  handleBookmark,
  handleShare,
  toggleComments,
}) => {
  const [animateHeart, setAnimateHeart] = useState(false);
  const [animateRetweet, setAnimateRetweet] = useState(false);
  const [animateBookmark, setAnimateBookmark] = useState(false);

  const onLikeClick = (e) => {
    e.stopPropagation();
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 350);
    handleLike();
  };

  const onRetweetClick = (e) => {
    e.stopPropagation();
    setAnimateRetweet(true);
    setTimeout(() => setAnimateRetweet(false), 400);
    handleRetweet();
  };

  const onBookmarkClick = (e) => {
    e.stopPropagation();
    setAnimateBookmark(true);
    setTimeout(() => setAnimateBookmark(false), 300);
    handleBookmark();
  };

  return (
    <div className="flex items-center justify-between mt-3 max-w-md text-gray-500 select-none">
      {/* Reply */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleComments();
        }}
        className="group flex items-center space-x-1.5 hover:text-[#1d9bf0] transition-colors active:scale-90"
        title="Reply"
      >
        <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
          <MessageCircle className="w-4 h-4" />
        </div>
        <span className="text-xs">{commentsCount > 0 ? commentsCount : ""}</span>
      </button>

      {/* Retweet / Repost */}
      <button
        onClick={onRetweetClick}
        className={`group flex items-center space-x-1.5 transition-colors active:scale-90 ${
          isRetweeted ? "text-green-500 font-semibold" : "hover:text-green-500"
        }`}
        title="Repost"
      >
        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
          <Repeat2 className={`w-4 h-4 ${animateRetweet ? "animate-retweetSpin text-green-500" : ""}`} />
        </div>
        <span className="text-xs">{retweetsCount > 0 ? retweetsCount : ""}</span>
      </button>

      {/* Like */}
      <button
        onClick={onLikeClick}
        className={`group flex items-center space-x-1.5 transition-colors active:scale-90 ${
          isLiked ? "text-pink-600 font-semibold" : "hover:text-pink-600"
        }`}
        title="Like"
      >
        <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
          <Heart
            className={`w-4 h-4 transition-transform ${
              isLiked ? "fill-current text-pink-600" : ""
            } ${animateHeart ? "animate-heartPop text-pink-600" : ""}`}
          />
        </div>
        <span className="text-xs">{likesCount > 0 ? likesCount : ""}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={onBookmarkClick}
        className={`group flex items-center space-x-1.5 transition-colors active:scale-90 ${
          isBookmarked ? "text-[#1d9bf0]" : "hover:text-[#1d9bf0]"
        }`}
        title="Bookmark"
      >
        <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
          <Bookmark
            className={`w-4 h-4 ${
              isBookmarked ? "fill-current text-[#1d9bf0]" : ""
            } ${animateBookmark ? "animate-bookmarkPop text-[#1d9bf0]" : ""}`}
          />
        </div>
      </button>

      {/* Share / Copy Link */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
        className="group flex items-center p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors active:scale-90"
        title="Share"
      >
        <Share className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PostActions;

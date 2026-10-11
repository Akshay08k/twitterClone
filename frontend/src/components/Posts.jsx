import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../contexts/axios";
import PostHeader from "./post/PostHeader";
import PostContent from "./post/PostContent";
import PostActions from "./post/PostActions";
import CommentSection from "./CommentSection";
import { Trash2, MoreHorizontal, Link2, X, UserX, Sparkles, EyeOff, Info, Pencil } from "lucide-react";
import AlgoInspectModal from "./PopUp/AlgoInspectModal";
import toast from "react-hot-toast";

const Post = ({
  post,
  currentUser,
  editable = false,
  onBookmarkToggle,
  onPostDeleted,
  isNew = false,
  defaultShowComments = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSinglePostView = location.pathname === `/posts/${post._id}`;
  const [isLiked, setIsLiked] = useState(post.userLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isRetweeted, setIsRetweeted] = useState(post.isRetweeted || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [retweetsCount, setRetweetsCount] = useState(post.retweetsCount || 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Instant deletion & modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Block modal states
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  // Dismiss / Not interested negative signal state
  const [isDismissed, setIsDismissed] = useState(false);
  const [showAlgoModal, setShowAlgoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(post.description || "");
  const [editedText, setEditedText] = useState(post.description || "");
  const [isEditing, setIsEditing] = useState(false);
  const postElementRef = useRef(null);
  const dwellLoggedRef = useRef(false);

  // Implicit Dwell Time Tracker (1.5s in viewport sends implicit interest signal)
  useEffect(() => {
    if (!postElementRef.current || dwellLoggedRef.current) return;

    let dwellTimer = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dwellTimer = setTimeout(() => {
              if (!dwellLoggedRef.current) {
                dwellLoggedRef.current = true;
                axios.post("/posts/interaction", {
                  type: "dwell",
                  postId: post._id,
                  authorId: post.user?._id,
                  hashtags: post.hashtags || [],
                  dwellTimeMs: 1500,
                }).catch(() => {});
              }
            }, 1500);
          } else {
            if (dwellTimer) clearTimeout(dwellTimer);
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(postElementRef.current);
    return () => {
      observer.disconnect();
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [post._id]);

  // Handle "Not interested in this post" (Negative feedback signal)
  const handleDismiss = async () => {
    setIsMenuOpen(false);
    setIsDismissed(true);
    toast("We'll show fewer posts like this", { icon: "👎" });
    setTimeout(() => {
      if (onPostDeleted) onPostDeleted(post._id);
    }, 250);

    try {
      await axios.post(`/posts/dismiss/${post._id}`);
    } catch (err) {
      console.error("Dismiss failed", err);
    }
  };

  const isOwner =
    editable ||
    (currentUser?._id && post.user?._id && currentUser._id.toString() === post.user._id.toString());

  // Edit Post Handler (Twitter Premium Perk)
  const handleSaveEdit = async () => {
    if (!editedText.trim()) return;
    try {
      setIsEditing(true);
      await axios.put(`/posts/${post._id}`, { description: editedText.trim() });
      setCurrentDescription(editedText.trim());
      setShowEditModal(false);
      toast.success("Post updated successfully! ✨");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to edit post");
    } finally {
      setIsEditing(false);
    }
  };

  // OPTIMISTIC LIKE: 0ms visual feedback
  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Instantly toggle in UI
    setIsLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? Math.max(prev - 1, 0) : prev + 1));

    try {
      await axios.post(`/posts/${post._id}/like`);
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert if API fails
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error("Failed to like post");
    }
  };

  // OPTIMISTIC BOOKMARK: 0ms visual feedback
  const handleBookmark = async () => {
    const prevBookmarked = isBookmarked;
    const nextState = !prevBookmarked;

    // Instantly toggle in UI
    setIsBookmarked(nextState);
    toast.success(nextState ? "Added to your Bookmarks" : "Removed from Bookmarks");
    if (onBookmarkToggle) onBookmarkToggle();

    try {
      await axios.post(`/posts/${post._id}/bookmark`);
    } catch (error) {
      console.error("Error bookmarking post:", error);
      // Revert if API fails
      setIsBookmarked(prevBookmarked);
      toast.error("Failed to update bookmark");
    }
  };

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    setRetweetsCount((prev) => (isRetweeted ? Math.max(prev - 1, 0) : prev + 1));
    toast.success(isRetweeted ? "Undo repost" : "Reposted!");
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Post link copied to clipboard!");
  };

  // INSTANT OPTIMISTIC DELETE with smooth collapse animation
  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);

    // Give 250ms for the collapse animation to play, then remove from parent UI immediately!
    setTimeout(() => {
      if (onPostDeleted) onPostDeleted(post._id);
      toast.success("Post deleted");
    }, 220);

    try {
      await axios.delete(`/posts/${post._id}`);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post on server");
    }
  };

  const confirmBlock = async () => {
    if (!post.user?._id) return;
    setShowBlockModal(false);
    setIsBlocking(true);

    setTimeout(() => {
      onPostDeleted?.(post._id);
      toast.success(`Blocked @${post.user?.username}`);
    }, 200);

    try {
      await axios.post(`/user/block/${post.user._id}`);
    } catch (err) {
      console.error("Block failed", err);
      toast.error("Failed to block user");
    }
  };

  const handleCommentUpdate = (newComment, deletedCommentId = null) => {
    if (deletedCommentId) {
      setComments((prev) => prev.filter((comment) => comment._id !== deletedCommentId));
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

  if (isDismissed) return null;

  return (
    <>
      <div
        ref={postElementRef}
        className={`border-b border-[#24272c] hover:bg-white/[0.02] transition-all duration-200 ${
          isDeleting || isDismissed ? "animate-collapse opacity-0 pointer-events-none" : ""
        } ${isNew ? "animate-slideDownFade" : ""}`}
      >
        <article
          onClick={(e) => {
            if (isSinglePostView) return;
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            navigate(`/posts/${post._id}`);
          }}
          className={`px-4 py-3 ${isSinglePostView ? "" : "cursor-pointer"}`}
        >
          <div className="flex space-x-3">
            {/* User Avatar */}
            <Link
              to={`/profile/${post.user?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <img
                src={
                  post.user?.avatar ||
                  post.user?.profileImage ||
                  "/default-avatar.png"
                }
                alt={post.user?.username || "User"}
                className="w-10 h-10 rounded-full object-cover border border-[#24272c] hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Post Content & Actions */}
            <div className="flex-1 min-w-0">
              {/* Algorithmic Recommendation Reason Badge */}
              {post.recommendationReason && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAlgoModal(true);
                  }}
                  className="group inline-flex items-center space-x-1.5 text-xs text-[#1d9bf0] hover:text-white bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/25 px-2.5 py-0.5 rounded-full font-medium mb-1.5 transition-all cursor-pointer border border-[#1d9bf0]/20 hover:border-[#1d9bf0]/40"
                  title="Click to see why this post was recommended to you"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span>{post.recommendationReason}</span>
                  <span className="text-[10px] text-gray-400 group-hover:text-gray-300 transition-colors">· Why?</span>
                </button>
              )}

              <div className="flex items-center justify-between">
                <PostHeader user={post.user} createdAt={post.createdAt} />

                {/* 3-dots dropdown menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-1 w-48 bg-black border border-[#24272c] rounded-2xl shadow-card py-1.5 z-30 animate-fadeIn"
                    >
                      <button
                        onClick={() => {
                          handleShare();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#16181c] text-left transition-colors"
                      >
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <span>Copy link to post</span>
                      </button>

                      {/* Why this post? (Transparency breakdown) */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowAlgoModal(true);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#16181c] text-left transition-colors"
                      >
                        <Info className="w-4 h-4 text-[#1d9bf0]" />
                        <span>Why this post?</span>
                      </button>

                      {/* Not interested in this post (Negative Signal) */}
                      {!isOwner && (
                        <button
                          onClick={handleDismiss}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#16181c] text-left transition-colors"
                        >
                          <EyeOff className="w-4 h-4 text-gray-400" />
                          <span>Not interested in this</span>
                        </button>
                      )}

                      {isOwner ? (
                        <>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              if (currentUser?.isPremium || currentUser?.isVerified) {
                                setEditedText(currentDescription);
                                setShowEditModal(true);
                              } else {
                                toast("Editing posts is an X Premium feature!", { icon: "✨" });
                              }
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#16181c] text-left transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-[#1d9bf0]" />
                            <span>Edit post</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setShowDeleteModal(true);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 text-left transition-colors font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete post</span>
                          </button>
                        </>
                      ) : (
                        post.user?._id && (
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setShowBlockModal(true);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 text-left transition-colors font-medium"
                          >
                            <UserX className="w-4 h-4" />
                            <span>Block @{post.user?.username}</span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <PostContent post={{ ...post, description: currentDescription }} />

              <PostActions
                isLiked={isLiked}
                isRetweeted={isRetweeted}
                isBookmarked={isBookmarked}
                likesCount={likesCount}
                commentsCount={commentsCount}
                retweetsCount={retweetsCount}
                handleLike={handleLike}
                handleRetweet={handleRetweet}
                handleBookmark={handleBookmark}
                handleShare={handleShare}
                toggleComments={() => setShowComments(!showComments)}
              />
            </div>
          </div>
        </article>

        {/* Expandable Comment Section */}
        {showComments && (
          <div className="px-4 pb-3 border-t border-[#24272c]/40 bg-black/40">
            <CommentSection
              postId={post._id}
              initialComments={comments}
              onCommentUpdate={handleCommentUpdate}
              onDelete={handleCommentDelete}
            />
          </div>
        )}
      </div>

      {/* Twitter-Style Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-black border border-[#24272c] w-full max-w-xs sm:max-w-sm rounded-2xl shadow-card p-6 space-y-4"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white leading-tight">Delete post?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={confirmDelete}
                className="w-full bg-[#f4212e] hover:bg-[#dc1d28] text-white font-bold py-3 rounded-full text-sm transition-all duration-200 active:scale-95 shadow-lg"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-transparent hover:bg-white/10 text-white font-bold py-3 rounded-full text-sm border border-gray-600 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Twitter-Style Block User Confirmation Modal */}
      {showBlockModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowBlockModal(false);
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-black border border-[#24272c] w-full max-w-xs sm:max-w-sm rounded-2xl shadow-card p-6 space-y-4"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white leading-tight">
                Block @{post.user?.username}?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                They will not be able to follow you or view your posts, and you will not see posts or notifications from @{post.user?.username}.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={confirmBlock}
                className="w-full bg-[#f4212e] hover:bg-[#dc1d28] text-white font-bold py-3 rounded-full text-sm transition-all duration-200 active:scale-95 shadow-lg"
              >
                Block
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="w-full bg-transparent hover:bg-white/10 text-white font-bold py-3 rounded-full text-sm border border-gray-600 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Algorithmic Transparency Inspector Modal */}
      <AlgoInspectModal
        isOpen={showAlgoModal}
        onClose={() => setShowAlgoModal(false)}
        post={post}
      />

      {/* Edit Post Modal (Twitter Premium Exclusive) */}
      {showEditModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowEditModal(false);
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#000000] border border-[#2f3336] w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-[#2f3336] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-full bg-[#1d9bf0]/20 text-[#1d9bf0]">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">Edit Post</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="What is happening?!"
              className="w-full bg-[#16181c] text-white p-3.5 rounded-xl border border-[#2f3336] focus:border-[#1d9bf0] focus:outline-none text-sm resize-none"
            />

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#2f3336]">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-gray-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isEditing || !editedText.trim()}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white transition-all disabled:opacity-50"
              >
                {isEditing ? "Updating..." : "Update Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Post;

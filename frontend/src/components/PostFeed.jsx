import React, { useEffect, useState, useRef } from "react";
import axios from "../contexts/axios";
import usePostSocketSync from "../utils/usePostSync.js";
import Posts from "./Posts";
import { useSelector } from "react-redux";
import { Image, Smile, Sparkles, X, ArrowUp, RotateCw } from "lucide-react";
import toast from "react-hot-toast";

const PostList = () => {
  const [feedType, setFeedType] = useState("for-you"); // "for-you" | "following"
  const [posts, setPosts] = useState([]);
  const [queuedPosts, setQueuedPosts] = useState([]);
  const [newlyRevealedIds, setNewlyRevealedIds] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // In-feed compose state
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);

  const reduxUser = useSelector((state) => state.user);
  const MAX_CHARS = 280;

  const fetchPosts = async () => {
    setLoading(true);
    setQueuedPosts([]);
    try {
      const url = feedType === "following" ? "/posts?type=following" : "/posts";
      const response = await axios.get(url);
      if (response.status === 200) {
        setPosts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [feedType]);

  // Reveal queued posts with smooth animation & scroll
  const handleRevealNewPosts = () => {
    if (queuedPosts.length === 0) return;

    const newIds = new Set(queuedPosts.map((p) => p._id));
    setNewlyRevealedIds(newIds);

    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p._id));
      const toAdd = queuedPosts.filter((p) => !existingIds.has(p._id));
      return [...toAdd, ...prev];
    });

    setQueuedPosts([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      setNewlyRevealedIds(new Set());
    }, 2500);
  };

  // Manual feed reload
  const handleRefreshFeed = async () => {
    setIsRefreshing(true);
    if (queuedPosts.length > 0) {
      handleRevealNewPosts();
    } else {
      await fetchPosts();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  usePostSocketSync({
    onNewPost: (newPost) => {
      // If authored by the current logged-in user, show immediately
      const isOwnPost =
        reduxUser?._id &&
        newPost.user?._id &&
        newPost.user._id.toString() === reduxUser._id.toString();

      if (isOwnPost) {
        setPosts((prev) => {
          if (prev.some((p) => p._id === newPost._id)) return prev;
          return [newPost, ...prev];
        });
        setNewlyRevealedIds((prev) => new Set([...prev, newPost._id]));
        return;
      }

      // Someone else posted! Queue it to avoid disrupting current reading position
      setQueuedPosts((prev) => {
        if (prev.some((p) => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
    },
    onPostDeleted: (deletedPostId) => {
      setPosts((prev) => prev.filter((post) => post._id !== deletedPostId));
      setQueuedPosts((prev) => prev.filter((post) => post._id !== deletedPostId));
    },
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!description.trim() && !selectedImage) return;

    setIsPosting(true);
    const formData = new FormData();
    formData.append("description", description.trim());
    if (selectedImage) {
      formData.append("postImages", selectedImage);
    }

    try {
      const response = await axios.post("/posts/create", formData);
      if (response.status === 200) {
        setDescription("");
        removeSelectedImage();
        toast.success("Post sent!");
        // Socket will also broadcast, but we can prepend immediately if needed
        const createdPost = response.data.data;
        if (createdPost) {
          setNewlyRevealedIds((prev) => new Set([...prev, createdPost._id]));
          setPosts((prev) => {
            if (prev.some((p) => p._id === createdPost._id)) return prev;
            return [createdPost, ...prev];
          });
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const charPercentage = Math.min((description.length / MAX_CHARS) * 100, 100);
  const isOverLimit = description.length > MAX_CHARS;

  return (
    <div className="w-full min-h-screen">
      {/* Sticky Tab Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/85 border-b border-[#24272c]">
        <div className="flex items-center">
          <button
            onClick={() => {
              if (feedType === "for-you") handleRefreshFeed();
              else setFeedType("for-you");
            }}
            className="flex-1 py-3.5 text-center font-bold text-sm hover:bg-white/[0.03] transition-colors relative"
          >
            <span className={feedType === "for-you" ? "text-white" : "text-gray-500"}>
              For you
            </span>
            {feedType === "for-you" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1d9bf0] rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              if (feedType === "following") handleRefreshFeed();
              else setFeedType("following");
            }}
            className="flex-1 py-3.5 text-center font-bold text-sm hover:bg-white/[0.03] transition-colors relative"
          >
            <span className={feedType === "following" ? "text-white" : "text-gray-500"}>
              Following
            </span>
            {feedType === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1d9bf0] rounded-full" />
            )}
          </button>

          {/* Quick Refresh Icon */}
          <button
            onClick={handleRefreshFeed}
            disabled={isRefreshing}
            className="px-3.5 py-3 text-gray-500 hover:text-[#1d9bf0] hover:bg-white/[0.05] transition-all rounded-full mr-1 disabled:opacity-50"
            title="Refresh feed"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#1d9bf0]" : ""}`} />
          </button>
        </div>
      </div>

      {/* In-feed Tweet Composer Box */}
      <div className="px-4 py-3 border-b border-[#24272c]">
        <div className="flex space-x-3">
          <img
            src={reduxUser?.avatar || "/default-avatar.png"}
            alt={reduxUser?.username || "Avatar"}
            className="w-10 h-10 rounded-full object-cover border border-[#24272c] shrink-0"
          />

          <div className="flex-1 min-w-0">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is happening?!"
              rows={2}
              className="w-full bg-transparent text-white text-lg placeholder-gray-500 resize-none outline-none leading-relaxed"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-3 rounded-2xl overflow-hidden border border-[#24272c] max-h-80">
                <img
                  src={imagePreview}
                  alt="Attachment preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#24272c]/40">
              <div className="flex items-center space-x-1 text-[#1d9bf0]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors"
                  title="Media"
                >
                  <Image className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => toast("Emoji picker coming soon!", { icon: "😊" })}
                  className="p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {description.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs ${
                        isOverLimit
                          ? "text-red-500 font-bold"
                          : description.length > 250
                          ? "text-yellow-500"
                          : "text-gray-500"
                      }`}
                    >
                      {MAX_CHARS - description.length}
                    </span>
                    <div className="w-5 h-5 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="transparent"
                          className="text-[#24272c]"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="transparent"
                          strokeDasharray={50.26}
                          strokeDashoffset={50.26 - (50.26 * charPercentage) / 100}
                          className={
                            isOverLimit
                              ? "text-red-500"
                              : description.length > 250
                              ? "text-yellow-500"
                              : "text-[#1d9bf0]"
                          }
                        />
                      </svg>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCreatePost}
                  disabled={
                    isPosting ||
                    (!description.trim() && !selectedImage) ||
                    isOverLimit
                  }
                  className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold text-sm px-4 py-1.5 rounded-full transition-all duration-200"
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating "Show New Posts" Twitter/X-style Pill Indicator */}
      {queuedPosts.length > 0 && (
        <div className="sticky top-14 z-30 flex justify-center py-2.5 pointer-events-none">
          <button
            onClick={handleRevealNewPosts}
            className="pointer-events-auto group flex items-center gap-2.5 px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] active:scale-95 text-white font-semibold text-sm rounded-full shadow-lg shadow-[#1d9bf0]/35 transition-all duration-200 cursor-pointer backdrop-blur-md animate-pillPop animate-pulseGlow border border-white/10"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>
              {queuedPosts.length === 1
                ? "Show 1 new post"
                : `Show ${queuedPosts.length} new posts`}
            </span>
            <div className="flex -space-x-1.5 ml-1">
              {queuedPosts.slice(0, 3).map((p) => (
                <img
                  key={p._id}
                  src={p.user?.avatar || "/default-avatar.png"}
                  alt={p.user?.username || "Avatar"}
                  className="w-5 h-5 rounded-full border border-black object-cover"
                />
              ))}
            </div>
          </button>
        </div>
      )}

      {/* Feed List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1d9bf0] border-t-transparent"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 px-6 space-y-2">
          <Sparkles className="w-10 h-10 mx-auto text-[#1d9bf0]" />
          <h3 className="text-xl font-bold text-white">
            {feedType === "following" ? "No posts from followed users" : "Welcome to Twitty!"}
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {feedType === "following"
              ? "Follow people you like in the Explore tab or right sidebar to see their posts here."
              : "Be the first to post something or follow others to see what's happening!"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#24272c]">
          {posts.map((post) => (
            <Posts
              key={post._id}
              post={post}
              currentUser={reduxUser}
              isNew={newlyRevealedIds.has(post._id)}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;

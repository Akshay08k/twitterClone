import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Bookmark, Sparkles } from "lucide-react";
import axios from "../../contexts/axios";
import Posts from "../Posts";

const BookmarksPage = () => {
  const reduxUser = useSelector((state) => state.user);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/posts/bookmarks");
      if (res.data?.data) {
        setBookmarks(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="w-full min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/80 border-b border-[#24272c] px-4 py-3">
        <h1 className="text-xl font-bold text-white leading-tight">Bookmarks</h1>
        <p className="text-xs text-gray-500">@{reduxUser?.username}</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1d9bf0] border-t-transparent"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 px-6 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#16181c] border border-[#24272c] flex items-center justify-center text-[#1d9bf0]">
            <Bookmark className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Save posts for later</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Don't let the good ones fly away! Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#24272c]">
          {bookmarks.map((post) => (
            <Posts
              key={post._id}
              post={post}
              currentUser={reduxUser}
              editable={post.user?._id === reduxUser?._id}
              onBookmarkToggle={fetchBookmarks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;

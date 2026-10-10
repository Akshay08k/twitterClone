import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import axios from "../contexts/axios";
import toast from "react-hot-toast";

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [trends, setTrends] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Real Trending Hashtags
      try {
        setLoadingTrends(true);
        const trendsRes = await axios.get("/posts/trends");
        if (Array.isArray(trendsRes.data?.data)) {
          setTrends(trendsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch trends", err);
      } finally {
        setLoadingTrends(false);
      }

      // Fetch Real Suggested Users
      try {
        setLoadingSuggestions(true);
        const usersRes = await axios.get("/user/suggested");
        if (usersRes.data?.data) {
          setSuggestedUsers(usersRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch suggested users", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const isCurrentlyFollowing = !!followingMap[userId];
      if (isCurrentlyFollowing) {
        await axios.delete(`/follow/remove/${userId}`);
        setFollowingMap((prev) => ({ ...prev, [userId]: false }));
        toast.success("Unfollowed");
      } else {
        await axios.post(`/follow/create/${userId}`);
        setFollowingMap((prev) => ({ ...prev, [userId]: true }));
        toast.success("Following");
      }
    } catch (err) {
      console.error("Follow error", err);
      toast.error("Failed to update follow status");
    }
  };

  return (
    <aside className="hidden lg:block w-80 xl:w-96 pl-6 py-3 space-y-4 select-none">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="sticky top-2 z-20">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#1d9bf0] transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#16181c] text-white text-sm rounded-full pl-10 pr-4 py-2.5 border border-transparent focus:border-[#1d9bf0] focus:bg-black focus:outline-none transition-all placeholder-gray-500"
          />
        </div>
      </form>

      {/* Subscribe to Premium Card */}
      <div className="bg-[#16181c] rounded-2xl p-4 border border-[#24272c] space-y-2">
        <h3 className="font-extrabold text-white text-base leading-snug">Subscribe to Premium</h3>
        <p className="text-gray-400 text-xs leading-relaxed">
          Subscribe to unlock new features, verified badge, and expanded reach.
        </p>
        <button
          onClick={() => toast("Premium subscription simulation active!", { icon: "✨" })}
          className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-sm px-4 py-1.5 rounded-full transition-all duration-200"
        >
          Subscribe
        </button>
      </div>

      {/* Real What's Happening Card */}
      <div className="bg-[#16181c] rounded-2xl border border-[#24272c] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#24272c]/40">
          <h3 className="font-extrabold text-white text-base">What's happening</h3>
          <Sparkles className="w-4 h-4 text-[#1d9bf0]" />
        </div>

        <div className="divide-y divide-[#24272c]/30">
          {loadingTrends ? (
            <div className="p-4 text-center text-gray-500 text-xs">Loading trends...</div>
          ) : trends.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-xs">
              No trending hashtags yet. Include <span className="text-[#1d9bf0]">#hashtags</span> in your posts!
            </div>
          ) : (
            trends.map((trend, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(trend.tag)}`)}
                className="px-4 py-2.5 hover:bg-[#1f2227] cursor-pointer transition-colors"
              >
                <p className="text-gray-500 text-xs">Trending</p>
                <p className="font-bold text-white text-sm mt-0.5">{trend.tag}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {trend.postsCount} {trend.postsCount === 1 ? "post" : "posts"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Real Who to Follow Card */}
      <div className="bg-[#16181c] rounded-2xl border border-[#24272c] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#24272c]/40">
          <h3 className="font-extrabold text-white text-base">Who to follow</h3>
        </div>

        <div className="divide-y divide-[#24272c]/30">
          {loadingSuggestions ? (
            <div className="p-4 text-center text-gray-500 text-xs">Finding suggested people...</div>
          ) : suggestedUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-xs">No suggestions right now</div>
          ) : (
            suggestedUsers.map((user) => {
              const isFollowing = !!followingMap[user._id];
              return (
                <div
                  key={user._id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-[#1f2227] transition-colors"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center space-x-3 min-w-0 flex-1 mr-2"
                  >
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-[#24272c]"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate hover:underline">
                        {user.username}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        @{user.userHandle || user.username}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollow(user._id)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 ${
                      isFollowing
                        ? "bg-transparent text-white border border-gray-600 hover:border-red-500 hover:text-red-500"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 text-xs text-gray-500 space-y-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link to="/explore" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link to="/explore" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link to="/explore" className="hover:underline">Cookies</Link>
          <span>·</span>
          <Link to="/settings" className="hover:underline">Settings</Link>
        </div>
        <p className="text-gray-600">© 2026 Twitty, Inc.</p>
      </footer>
    </aside>
  );
};

export default RightSidebar;

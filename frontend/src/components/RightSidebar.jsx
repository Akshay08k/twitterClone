import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, Sparkles, Sliders, RotateCcw, ThumbsUp, ThumbsDown, EyeOff, BadgeCheck } from "lucide-react";
import axios from "../contexts/axios";
import PremiumModal from "./PopUp/PremiumModal";
import toast from "react-hot-toast";

const RightSidebar = () => {
  const reduxUser = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [trends, setTrends] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [affinityProfile, setAffinityProfile] = useState(null);
  const [loadingAffinity, setLoadingAffinity] = useState(false);
  const [showMuted, setShowMuted] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
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

      // Fetch Algorithm Affinity Profile
      try {
        setLoadingAffinity(true);
        const affRes = await axios.get("/posts/recommendations/affinity");
        if (affRes.data?.data) {
          setAffinityProfile(affRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch algorithm affinity", err);
      } finally {
        setLoadingAffinity(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickTune = async (tag, delta) => {
    try {
      await axios.post("/posts/recommendations/tune-topic", { tag, delta });
      toast.success(delta > 0 ? `Boosted ${tag}` : `Muted ${tag}`);
      const affRes = await axios.get("/posts/recommendations/affinity");
      if (affRes.data?.data) setAffinityProfile(affRes.data.data);
    } catch (err) {
      toast.error("Failed to tune topic");
    }
  };

  const handleResetAlgorithm = async () => {
    try {
      await axios.post("/posts/recommendations/reset");
      toast.success("Algorithm reset to default discovery!");
      setAffinityProfile({ topPositiveTags: [], mutedTags: [], activeClusters: [], totalSignals: 0 });
    } catch (err) {
      toast.error("Failed to reset algorithm");
    }
  };

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
    <aside className="hidden lg:block w-80 xl:w-96 pl-6 py-3 space-y-4 select-none sticky top-0 h-screen overflow-y-auto scrollbar-none">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="sticky top-0 z-20 bg-black/90 backdrop-blur-md pt-1 pb-2 -mt-1">
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
      {reduxUser?.isPremium || reduxUser?.isVerified ? (
        <div className="bg-[#16181c] rounded-2xl p-4 border border-[#1d9bf0]/30 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-extrabold text-white text-base leading-snug">
                {reduxUser.premiumTier === "premium_plus" ? "X Premium+" : "X Premium"}
              </h3>
              <BadgeCheck
                className={`w-4 h-4 fill-current ${
                  reduxUser.premiumTier === "premium_plus" ? "text-[#e2b714]" : "text-[#1d9bf0]"
                }`}
              />
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              Active
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            You are verified with 2x algorithm ranking priority and ad-free browsing privileges.
          </p>
          <button
            onClick={() => navigate("/premium")}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded-full transition-all duration-200"
          >
            Manage Membership
          </button>
        </div>
      ) : (
        <div className="bg-[#16181c] rounded-2xl p-4 border border-[#24272c] space-y-2">
          <h3 className="font-extrabold text-white text-base leading-snug">Subscribe to Premium</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Subscribe to unlock verified badge, 2x algorithm boost, and edit post capabilities.
          </p>
          <button
            onClick={() => setIsPremiumModalOpen(true)}
            className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-sm px-4 py-1.5 rounded-full transition-all duration-200"
          >
            Subscribe
          </button>
        </div>
      )}

      {/* Real Algorithm Mix Card */}
      <div className="bg-[#16181c] rounded-2xl border border-[#24272c] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#24272c]/40">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#1d9bf0]" />
            <h3 className="font-extrabold text-white text-base">Your Algorithm Mix</h3>
          </div>
          {affinityProfile?.totalSignals > 0 && (
            <span className="text-[11px] font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {affinityProfile.totalSignals} signals
            </span>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Active SimCluster */}
          {affinityProfile?.activeClusters?.length > 0 && (
            <div className="p-2.5 rounded-xl bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-base">{affinityProfile.activeClusters[0].icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {affinityProfile.activeClusters[0].label}
                  </p>
                  <p className="text-[10px] text-[#1d9bf0]">Primary Affinity Cluster</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#1d9bf0] shrink-0 ml-2">
                +{affinityProfile.activeClusters[0].score} pts
              </span>
            </div>
          )}

          {/* Top positive tags */}
          {affinityProfile?.topPositiveTags?.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Topics Twitty learned you like
              </p>
              <div className="flex flex-wrap gap-1.5">
                {affinityProfile.topPositiveTags.slice(0, 6).map(([tag, score], idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#202327] hover:bg-[#272b30] border border-[#2f3336] text-xs text-gray-200 transition-colors"
                  >
                    <span
                      onClick={() => navigate(`/explore?q=${encodeURIComponent(tag)}`)}
                      className="cursor-pointer hover:underline font-medium"
                    >
                      {tag}
                    </span>
                    <button
                      onClick={() => handleQuickTune(tag, 20)}
                      title="Boost topic"
                      className="text-gray-500 hover:text-[#1d9bf0] transition-colors ml-0.5"
                    >
                      <ThumbsUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleQuickTune(tag, -35)}
                      title="Mute topic"
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <ThumbsDown className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed">
              Interact with posts by liking, bookmarking, or dwelling to train your custom Heavy Ranker feed.
            </p>
          )}

          {/* Muted topics toggle */}
          {affinityProfile?.mutedTags?.length > 0 && (
            <div className="pt-2 border-t border-[#24272c]/40">
              <button
                onClick={() => setShowMuted(!showMuted)}
                className="text-xs text-gray-400 hover:text-gray-200 flex items-center space-x-1 transition-colors"
              >
                <EyeOff className="w-3 h-3 text-red-400" />
                <span>
                  {showMuted ? "Hide" : "Show"} {affinityProfile.mutedTags.length} muted topics
                </span>
              </button>
              {showMuted && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {affinityProfile.mutedTags.map(([tag], idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] text-red-400"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleQuickTune(tag, 40)}
                        title="Unmute"
                        className="text-gray-400 hover:text-white ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reset Algorithm Option */}
          {affinityProfile?.totalSignals > 0 && (
            <div className="pt-2 border-t border-[#24272c]/40 flex justify-between items-center text-xs">
              <span className="text-gray-500">Want a fresh start?</span>
              <button
                onClick={handleResetAlgorithm}
                className="text-gray-400 hover:text-red-400 flex items-center space-x-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Algorithm</span>
              </button>
            </div>
          )}
        </div>
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

      {/* Quick Premium Subscribe Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onSubscribed={() => {
          setIsPremiumModalOpen(false);
        }}
      />
    </aside>
  );
};

export default RightSidebar;

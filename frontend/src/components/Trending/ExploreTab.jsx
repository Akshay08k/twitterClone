import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Sparkles, TrendingUp, Flame, X, UserPlus, Hash } from "lucide-react";
import axios from "../../contexts/axios";
import Posts from "../Posts";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const ExploreTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);

  // When searching, tabs are: top, latest, people
  // When browsing, tabs are: for-you, trending, latest, people
  const [activeTab, setActiveTab] = useState(queryParam ? "top" : "for-you");

  const [trends, setTrends] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  const [feedPosts, setFeedPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [searchPosts, setSearchPosts] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  const reduxUser = useSelector((state) => state.user);

  // Sync state whenever queryParam in URL changes
  useEffect(() => {
    setQuery(queryParam);
    if (queryParam) {
      setActiveTab("top");
      executeSearch(queryParam);
    } else {
      setActiveTab("for-you");
      fetchExploreHomeData();
    }
  }, [queryParam]);

  // Fetch real data for Explore Home (Trends, Suggested Users, Feed Posts)
  const fetchExploreHomeData = async () => {
    // 1. Fetch Real Trends
    try {
      setLoadingTrends(true);
      const trendsRes = await axios.get("/posts/trends");
      if (Array.isArray(trendsRes.data?.data)) {
        setTrends(trendsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load trends:", err);
    } finally {
      setLoadingTrends(false);
    }

    // 2. Fetch Suggested Users
    try {
      const usersRes = await axios.get("/user/suggested");
      if (Array.isArray(usersRes.data?.data)) {
        setSuggestedUsers(usersRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load suggested users:", err);
    }

    // 3. Fetch Recent Community Posts
    try {
      setLoadingFeed(true);
      const postsRes = await axios.get("/posts");
      if (Array.isArray(postsRes.data?.data)) {
        setFeedPosts(postsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load explore posts:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  // Perform search against backend
  const executeSearch = async (searchTerm) => {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) return;

    setLoadingSearch(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        axios.get(`/posts?search=${encodeURIComponent(cleanTerm)}`),
        axios.get(`/user/search?q=${encodeURIComponent(cleanTerm)}`),
      ]);

      setSearchPosts(postsRes.data?.data || []);
      setSearchUsers(usersRes.data?.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Failed to fetch search results");
    } finally {
      setLoadingSearch(false);
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchParams({});
    setSearchPosts([]);
    setSearchUsers([]);
  };

  const handleSelectTrend = (tag) => {
    setSearchParams({ q: tag });
  };

  const handleFollowToggle = async (userId) => {
    const isCurrentlyFollowing = !!followingMap[userId];
    try {
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
      console.error("Follow error:", err);
      toast.error("Failed to update follow status");
    }
  };

  const availableTabs = queryParam
    ? [
        { id: "top", label: "Top" },
        { id: "latest", label: "Latest" },
        { id: "people", label: "People" },
      ]
    : [
        { id: "for-you", label: "For you" },
        { id: "trending", label: "Trending" },
        { id: "latest", label: "Latest" },
        { id: "people", label: "Who to follow" },
      ];

  return (
    <div className="w-full min-h-screen pb-16">
      {/* Sticky Header with Search Bar and Navigation Tabs */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/85 border-b border-[#24272c] pt-2 px-3 space-y-2">
        {/* Search input form */}
        <form onSubmit={onSearchSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#1d9bf0] transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, #hashtags, or @people"
            className="w-full bg-[#16181c] text-white text-sm rounded-full pl-10 pr-10 py-2.5 border border-transparent focus:border-[#1d9bf0] focus:bg-black focus:outline-none transition-all placeholder-gray-500"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Tab navigation */}
        <div className="flex border-t border-[#24272c]/40 pt-1 -mb-px">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative text-center ${
                activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1d9bf0] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. SEARCH RESULTS VIEW (When queryParam is active)         */}
      {/* ========================================================= */}
      {queryParam ? (
        loadingSearch ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1d9bf0] border-t-transparent"></div>
          </div>
        ) : (
          <div>
            {/* Top Search Tab */}
            {activeTab === "top" && (
              <div>
                {/* Matched People Banner */}
                {searchUsers.length > 0 && (
                  <div className="border-b border-[#24272c] py-2">
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      People
                    </div>
                    <div className="divide-y divide-[#24272c]/30">
                      {searchUsers.slice(0, 3).map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-[#16181c] transition-colors"
                        >
                          <Link
                            to={`/profile/${u.username}`}
                            className="flex items-center space-x-3 min-w-0 flex-1 mr-3"
                          >
                            <img
                              src={u.avatar || "/default-avatar.png"}
                              alt={u.username}
                              className="w-11 h-11 rounded-full object-cover border border-[#24272c]"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white text-sm truncate hover:underline">
                                {u.username}
                              </p>
                              <p className="text-gray-500 text-xs truncate">
                                @{u.userHandle || u.username}
                              </p>
                              {u.bio && (
                                <p className="text-gray-400 text-xs mt-0.5 truncate">{u.bio}</p>
                              )}
                            </div>
                          </Link>
                          <button
                            onClick={() => handleFollowToggle(u._id)}
                            className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                              followingMap[u._id]
                                ? "bg-transparent text-white border border-gray-600 hover:border-red-500 hover:text-red-500"
                                : "bg-white text-black hover:bg-gray-200"
                            }`}
                          >
                            {followingMap[u._id] ? "Following" : "Follow"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Posts */}
                {searchPosts.length === 0 && searchUsers.length === 0 ? (
                  <div className="text-center py-20 px-4 space-y-2">
                    <p className="text-white font-bold text-lg">No results found for "{queryParam}"</p>
                    <p className="text-gray-500 text-xs max-w-sm mx-auto">
                      Try searching for different keywords or check out trending hashtags.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#24272c]">
                    {searchPosts.map((post) => (
                      <Posts
                        key={post._id}
                        post={post}
                        currentUser={reduxUser}
                        onPostDeleted={(id) =>
                          setSearchPosts((prev) => prev.filter((p) => p._id !== id))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Latest Search Tab */}
            {activeTab === "latest" && (
              <div>
                {searchPosts.length === 0 ? (
                  <div className="text-center py-20 px-4 space-y-2">
                    <p className="text-white font-bold text-lg">No latest posts for "{queryParam}"</p>
                    <p className="text-gray-500 text-xs">Be the first to post using this tag!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#24272c]">
                    {searchPosts
                      .slice()
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((post) => (
                        <Posts
                          key={post._id}
                          post={post}
                          currentUser={reduxUser}
                          onPostDeleted={(id) =>
                            setSearchPosts((prev) => prev.filter((p) => p._id !== id))
                          }
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* People Search Tab */}
            {activeTab === "people" && (
              <div>
                {searchUsers.length === 0 ? (
                  <div className="text-center py-20 px-4 space-y-2">
                    <p className="text-white font-bold text-lg">No users found for "{queryParam}"</p>
                    <p className="text-gray-500 text-xs">Try searching by username or handle.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#24272c]">
                    {searchUsers.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#16181c] transition-colors"
                      >
                        <Link
                          to={`/profile/${u.username}`}
                          className="flex items-center space-x-3 min-w-0 flex-1 mr-3"
                        >
                          <img
                            src={u.avatar || "/default-avatar.png"}
                            alt={u.username}
                            className="w-11 h-11 rounded-full object-cover border border-[#24272c]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white text-sm truncate hover:underline">
                              {u.username}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              @{u.userHandle || u.username}
                            </p>
                            {u.bio && (
                              <p className="text-gray-400 text-xs mt-0.5 truncate">{u.bio}</p>
                            )}
                          </div>
                        </Link>
                        <button
                          onClick={() => handleFollowToggle(u._id)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                            followingMap[u._id]
                              ? "bg-transparent text-white border border-gray-600 hover:border-red-500 hover:text-red-500"
                              : "bg-white text-black hover:bg-gray-200"
                          }`}
                        >
                          {followingMap[u._id] ? "Following" : "Follow"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        /* ========================================================= */
        /* 2. DEFAULT EXPLORE HUB (When NO search query is active)    */
        /* ========================================================= */
        <div>
          {/* TAB 1: FOR YOU */}
          {activeTab === "for-you" && (
            <div>
              {/* Trends Section */}
              <div className="border-b border-[#24272c]">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="font-extrabold text-white text-lg">Trending for you</h2>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#1d9bf0]" />
                </div>

                {loadingTrends ? (
                  <div className="p-6 text-center text-gray-500 text-xs">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1d9bf0] border-t-transparent mx-auto mb-2"></div>
                    Loading trends...
                  </div>
                ) : trends.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No trending hashtags yet. Include <span className="text-[#1d9bf0]">#hashtags</span> in your posts to start a trend!
                  </div>
                ) : (
                  <div className="divide-y divide-[#24272c]/40">
                    {trends.slice(0, 5).map((trend, idx) => (
                      <div
                        key={trend.tag || idx}
                        onClick={() => handleSelectTrend(trend.tag)}
                        className="px-4 py-3 hover:bg-[#16181c] cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-gray-500 text-xs">Trending in Twitty</p>
                            <p className="font-bold text-white text-base mt-0.5 hover:underline">
                              {trend.tag}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {trend.postsCount} {trend.postsCount === 1 ? "post" : "posts"}
                            </p>
                          </div>
                          <span className="text-gray-600 text-xs font-bold">#{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested People to Follow */}
              {suggestedUsers.length > 0 && (
                <div className="border-b border-[#24272c] py-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <h3 className="font-extrabold text-white text-sm">Who to follow</h3>
                    <button
                      onClick={() => setActiveTab("people")}
                      className="text-xs text-[#1d9bf0] hover:underline"
                    >
                      Show more
                    </button>
                  </div>
                  <div className="divide-y divide-[#24272c]/30">
                    {suggestedUsers.slice(0, 3).map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#16181c] transition-colors"
                      >
                        <Link
                          to={`/profile/${u.username}`}
                          className="flex items-center space-x-3 min-w-0 flex-1 mr-3"
                        >
                          <img
                            src={u.avatar || "/default-avatar.png"}
                            alt={u.username}
                            className="w-10 h-10 rounded-full object-cover border border-[#24272c]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white text-sm truncate hover:underline">
                              {u.username}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              @{u.userHandle || u.username}
                            </p>
                          </div>
                        </Link>
                        <button
                          onClick={() => handleFollowToggle(u._id)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                            followingMap[u._id]
                              ? "bg-transparent text-white border border-gray-600 hover:border-red-500 hover:text-red-500"
                              : "bg-white text-black hover:bg-gray-200"
                          }`}
                        >
                          {followingMap[u._id] ? "Following" : "Follow"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explore Community Posts */}
              <div>
                <div className="px-4 py-3 border-b border-[#24272c]">
                  <h3 className="font-extrabold text-white text-base">Explore posts</h3>
                </div>

                {loadingFeed ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#1d9bf0] border-t-transparent"></div>
                  </div>
                ) : feedPosts.length === 0 ? (
                  <div className="text-center py-16 px-4 text-gray-500 text-sm">
                    No posts available yet. Create a post to get started!
                  </div>
                ) : (
                  <div className="divide-y divide-[#24272c]">
                    {feedPosts.map((post) => (
                      <Posts
                        key={post._id}
                        post={post}
                        currentUser={reduxUser}
                        onPostDeleted={(id) =>
                          setFeedPosts((prev) => prev.filter((p) => p._id !== id))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TRENDING */}
          {activeTab === "trending" && (
            <div className="divide-y divide-[#24272c]">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-[#1d9bf0]" />
                  <h2 className="font-extrabold text-white text-lg">All Trending Topics</h2>
                </div>
                <span className="text-gray-500 text-xs font-medium">Real-time</span>
              </div>

              {loadingTrends ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1d9bf0] border-t-transparent mx-auto mb-2"></div>
                  Loading trends...
                </div>
              ) : trends.length === 0 ? (
                <div className="px-4 py-16 text-center text-gray-500 text-sm">
                  <Hash className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="font-bold text-white text-base">No Trends Yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    When people use #hashtags in their posts, they will show up here.
                  </p>
                </div>
              ) : (
                trends.map((trend, idx) => (
                  <div
                    key={trend.tag || idx}
                    onClick={() => handleSelectTrend(trend.tag)}
                    className="px-4 py-3 hover:bg-[#16181c] cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-xs">{trend.category || "Trending"}</p>
                        <p className="font-bold text-white text-base mt-0.5 hover:underline">
                          {trend.tag}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {trend.postsCount} {trend.postsCount === 1 ? "post" : "posts"}
                        </p>
                      </div>
                      <span className="text-gray-600 text-sm font-bold">#{idx + 1}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: LATEST */}
          {activeTab === "latest" && (
            <div>
              <div className="px-4 py-3 border-b border-[#24272c] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#1d9bf0]" />
                <h2 className="font-extrabold text-white text-base">Latest Posts</h2>
              </div>

              {loadingFeed ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#1d9bf0] border-t-transparent"></div>
                </div>
              ) : feedPosts.length === 0 ? (
                <div className="text-center py-16 px-4 text-gray-500 text-sm">
                  No posts to show yet.
                </div>
              ) : (
                <div className="divide-y divide-[#24272c]">
                  {feedPosts
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((post) => (
                      <Posts
                        key={post._id}
                        post={post}
                        currentUser={reduxUser}
                        onPostDeleted={(id) =>
                          setFeedPosts((prev) => prev.filter((p) => p._id !== id))
                        }
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WHO TO FOLLOW (PEOPLE) */}
          {activeTab === "people" && (
            <div className="divide-y divide-[#24272c]">
              <div className="px-4 py-3 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#1d9bf0]" />
                <h2 className="font-extrabold text-white text-base">Suggested People</h2>
              </div>

              {suggestedUsers.length === 0 ? (
                <div className="text-center py-16 px-4 text-gray-500 text-sm">
                  No suggestions available right now.
                </div>
              ) : (
                suggestedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-[#16181c] transition-colors"
                  >
                    <Link
                      to={`/profile/${u.username}`}
                      className="flex items-center space-x-3 min-w-0 flex-1 mr-3"
                    >
                      <img
                        src={u.avatar || "/default-avatar.png"}
                        alt={u.username}
                        className="w-11 h-11 rounded-full object-cover border border-[#24272c]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-sm truncate hover:underline">
                          {u.username}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          @{u.userHandle || u.username}
                        </p>
                        {u.bio && (
                          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{u.bio}</p>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => handleFollowToggle(u._id)}
                      className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all shrink-0 ${
                        followingMap[u._id]
                          ? "bg-transparent text-white border border-gray-600 hover:border-red-500 hover:text-red-500"
                          : "bg-white text-black hover:bg-gray-200"
                      }`}
                    >
                      {followingMap[u._id] ? "Following" : "Follow"}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreTab;

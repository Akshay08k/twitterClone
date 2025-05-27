import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
} from "lucide-react";

const ExploreTab = () => {
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [popularPosts, setPopularPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [topicsToFollow, setTopicsToFollow] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data that would come from your existing API
  const mockPopularPosts = [
    {
      id: 1,
      user: {
        name: "Tech Enthusiast",
        handle: "@techie_dev",
        avatar: "https://i.pravatar.cc/40?img=1",
        verified: true,
      },
      content:
        "Just built an amazing React app with some cool features! The component architecture is so clean 🚀",
      timestamp: "2h",
      engagement: { likes: 245, retweets: 67, comments: 34 },
      isPopular: true,
    },
    {
      id: 2,
      user: {
        name: "Design Studio",
        handle: "@creative_minds",
        avatar: "https://i.pravatar.cc/40?img=2",
      },
      content:
        "New UI/UX trends for 2024 are here! Dark mode is definitely staying, but we're seeing more gradient overlays and micro-animations.",
      timestamp: "4h",
      engagement: { likes: 892, retweets: 156, comments: 89 },
      isPopular: true,
    },
    {
      id: 3,
      user: {
        name: "Startup News",
        handle: "@startup_daily",
        avatar: "https://i.pravatar.cc/40?img=3",
      },
      content:
        "Breaking: Major funding round announced for AI company. This could change everything in the industry.",
      timestamp: "6h",
      engagement: { likes: 1247, retweets: 423, comments: 167 },
      isPopular: true,
    },
  ];

  const mockSuggestedUsers = [
    {
      id: 1,
      name: "Sarah Johnson",
      handle: "@sarah_codes",
      avatar: "https://i.pravatar.cc/40?img=4",
      bio: "Full-stack developer | React enthusiast | Coffee lover",
      followers: "2.3K",
      isFollowing: false,
    },
    {
      id: 2,
      name: "Mike Chen",
      handle: "@mike_designs",
      avatar: "https://i.pravatar.cc/40?img=5",
      bio: "UI/UX Designer at TechCorp | Creating beautiful interfaces",
      followers: "5.1K",
      isFollowing: false,
    },
    {
      id: 3,
      name: "Alex Rivera",
      handle: "@alex_startup",
      avatar: "https://i.pravatar.cc/40?img=6",
      bio: "Entrepreneur | Building the future | Angel investor",
      followers: "12.8K",
      isFollowing: false,
    },
  ];

  const mockTopics = [
    { id: 1, name: "Web Development", posts: "45.2K posts", followers: "125K" },
    {
      id: 2,
      name: "Artificial Intelligence",
      posts: "89.1K posts",
      followers: "234K",
    },
    { id: 3, name: "Startup Life", posts: "23.7K posts", followers: "87K" },
    {
      id: 4,
      name: "Design Inspiration",
      posts: "67.3K posts",
      followers: "156K",
    },
  ];

  useEffect(() => {
    // Simulate API calls - replace with your actual API
    setTimeout(() => {
      setPopularPosts(mockPopularPosts);
      setSuggestedUsers(mockSuggestedUsers);
      setTopicsToFollow(mockTopics);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFollow = (userId) => {
    setSuggestedUsers((users) =>
      users.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
  };

  const ExploreHeader = () => (
    <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-10">
      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for posts, people, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 text-white rounded-full py-3 pl-12 pr-4 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-8">
          {[
            { id: "for-you", label: "For you" },
            { id: "popular", label: "Popular" },
            { id: "people", label: "People" },
            { id: "topics", label: "Topics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 relative ${
                activeTab === tab.id
                  ? "text-white font-semibold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const PopularPost = ({ post }) => (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-950 cursor-pointer">
      <div className="flex space-x-3">
        <img
          src={post.user.avatar}
          alt={post.user.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-white font-bold">{post.user.name}</span>
            {post.user.verified && <span className="text-blue-500">✓</span>}
            <span className="text-gray-500">{post.user.handle}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{post.timestamp}</span>
            {post.isPopular && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Popular
              </span>
            )}
          </div>
          <p className="text-white mb-3">{post.content}</p>
          <div className="flex items-center justify-between max-w-md">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-400 group">
              <div className="p-2 rounded-full group-hover:bg-blue-900/20">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-sm">{post.engagement.comments}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-400 group">
              <div className="p-2 rounded-full group-hover:bg-green-900/20">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="text-sm">{post.engagement.retweets}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-red-400 group">
              <div className="p-2 rounded-full group-hover:bg-red-900/20">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-sm">{post.engagement.likes}</span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-300">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SuggestedUser = ({ user }) => (
    <div className="border border-gray-800 rounded-2xl p-4 bg-gray-900">
      <div className="flex items-start justify-between mb-3">
        <div className="flex space-x-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="text-white font-bold">{user.name}</h3>
            <p className="text-gray-500 text-sm">{user.handle}</p>
          </div>
        </div>
        <button
          onClick={() => handleFollow(user.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            user.isFollowing
              ? "bg-gray-800 text-white border border-gray-600 hover:bg-red-900 hover:text-red-400"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {user.isFollowing ? "Following" : "Follow"}
        </button>
      </div>
      <p className="text-gray-300 text-sm mb-3">{user.bio}</p>
      <p className="text-gray-500 text-sm">{user.followers} followers</p>
    </div>
  );

  const TopicCard = ({ topic }) => (
    <div className="border border-gray-800 rounded-2xl p-4 bg-gray-900 hover:bg-gray-800 cursor-pointer">
      <h3 className="text-white font-bold text-lg mb-2">{topic.name}</h3>
      <div className="flex items-center justify-between text-gray-500 text-sm">
        <span>{topic.posts}</span>
        <span>{topic.followers} following</span>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <ExploreHeader />

      <div className="max-w-2xl mx-auto">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {activeTab === "for-you" && (
              <div>
                {/* Mix of popular posts and suggested content */}
                {popularPosts.slice(0, 2).map((post) => (
                  <PopularPost key={post.id} post={post} />
                ))}

                <div className="p-4 border-b border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Who to follow
                  </h2>
                  <div className="grid gap-4">
                    {suggestedUsers.slice(0, 2).map((user) => (
                      <SuggestedUser key={user.id} user={user} />
                    ))}
                  </div>
                </div>

                {popularPosts.slice(2).map((post) => (
                  <PopularPost key={post.id} post={post} />
                ))}
              </div>
            )}

            {activeTab === "popular" && (
              <div>
                {popularPosts.map((post) => (
                  <PopularPost key={post.id} post={post} />
                ))}
              </div>
            )}

            {activeTab === "people" && (
              <div className="p-4 space-y-4">
                {suggestedUsers.map((user) => (
                  <SuggestedUser key={user.id} user={user} />
                ))}
              </div>
            )}

            {activeTab === "topics" && (
              <div className="p-4 grid gap-4">
                {topicsToFollow.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreTab;

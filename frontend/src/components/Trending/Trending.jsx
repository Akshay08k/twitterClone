import { SearchIcon } from "../Icons/Icons.jsx";

export default function Treding() {
  const trends = [
    {
      category: "Technology · Trending",
      title: "#React",
      tweets: "234.5K",
    },
    {
      category: "Trending in Technology",
      title: "#AI",
      tweets: "182K",
    },
    {
      category: "Business · Trending",
      title: "ChatGPT",
      description: "OpenAI releases new features for ChatGPT",
      tweets: "155.2K",
    },
    {
      category: "Sports · Trending",
      title: "#WorldCup",
      tweets: "92.1K",
    },
    {
      category: "Entertainment · Trending",
      title: "#NewMovie",
      description: "Latest blockbuster breaks box office records",
      tweets: "45.6K",
    },
  ];

  const whoToFollow = [
    {
      name: "Tech News",
      handle: "@technews",
      verified: true,
      avatar: "https://via.placeholder.com/40",
    },
    {
      name: "Web Dev Community",
      handle: "@webdev",
      verified: true,
      avatar: "https://via.placeholder.com/40",
    },
    {
      name: "Coding Tips",
      handle: "@codingtips",
      verified: false,
      avatar: "https://via.placeholder.com/40",
    },
  ];

  return (
    <aside className="hidden lg:block w-80 ml-8">
      {/* Search Bar */}
      <div className="sticky top-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-900 rounded-full py-3 px-12 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
          />
          <SearchIcon className="absolute left-4 top-3.5 text-gray-500" />
        </div>

        {/* Trending Section */}
        <div className="bg-gray-900 rounded-2xl mt-4">
          <h2 className="text-xl font-bold px-4 py-3">Trends for you</h2>

          <div className="divide-y divide-gray-800">
            {trends.map((trend, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-gray-800/50 cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    {trend.category}
                  </span>
                  <button className="p-1 hover:bg-blue-500/20 hover:text-blue-500 rounded-full transition">
                    <MoreIcon />
                  </button>
                </div>
                <h3 className="font-bold mt-0.5">{trend.title}</h3>
                {trend.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {trend.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-0.5">
                  {trend.tweets} Tweets
                </p>
              </div>
            ))}
            <button className="p-4 text-blue-500 hover:bg-gray-800/50 w-full text-left transition">
              Show more
            </button>
          </div>
        </div>

        {/* Who to Follow Section */}
        <div className="bg-gray-900 rounded-2xl mt-4">
          <h2 className="text-xl font-bold px-4 py-3">Who to follow</h2>

          <div className="divide-y divide-gray-800">
            {whoToFollow.map((user, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-gray-800/50 transition flex items-center justify-between"
              >
                <div className="flex items-center">
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <span className="font-bold">{user.name}</span>
                      {user.verified && (
                        <VerifiedIcon className="ml-0.5 w-4 h-4" />
                      )}
                    </div>
                    <span className="text-gray-500">{user.handle}</span>
                  </div>
                </div>
                <button className="bg-white text-black px-4 py-1.5 rounded-full font-bold hover:bg-gray-200 transition">
                  Follow
                </button>
              </div>
            ))}
            <button className="p-4 text-blue-500 hover:bg-gray-800/50 w-full text-left transition">
              Show more
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="px-4 py-3 text-sm text-gray-500">
          <nav className="flex flex-wrap gap-2">
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Cookie Policy
            </a>
            <a href="#" className="hover:underline">
              Accessibility
            </a>
            <a href="#" className="hover:underline">
              Ads info
            </a>
            <a href="#" className="hover:underline">
              More
            </a>
            <span>© 2025 X Corp.</span>
          </nav>
        </footer>
      </div>
    </aside>
  );
}


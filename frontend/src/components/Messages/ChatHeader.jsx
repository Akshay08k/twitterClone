const ChatHeader = ({ user }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            className="w-12 h-12 rounded-full ring-2 ring-blue-500/20 transition-all duration-300"
            src={user.avatar}
            alt={user.username}
          />
          {user.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg animate-pulse"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-white truncate">
            {user.username}
          </h2>
          <p className="text-gray-400 text-sm truncate">{user.userHandle}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-700/50 rounded-full transition-colors duration-200">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
        <button className="p-2 hover:bg-gray-700/50 rounded-full transition-colors duration-200">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

const FollowButton = ({
  isCurrentUser,
  isFollowing,
  onFollowToggle,
  onEditClick,
}) => {
  if (isCurrentUser) {
    return (
      <button
        className="mt-4 px-5 py-1.5 border border-gray-500 rounded-full font-bold hover:bg-gray-900/60 transition"
        onClick={onEditClick}
      >
        Edit profile
      </button>
    );
  }

  return (
    <button
      className={`mt-4 px-5 py-1.5 rounded-full font-bold transition ${
        isFollowing
          ? "border border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
      onClick={onFollowToggle}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;

import React from "react";

const FollowButton = ({
  isCurrentUser,
  isFollowing,
  requestSent,
  onFollowToggle,
  onWithdrawRequest,
  onEditClick,
}) => {
  if (isCurrentUser) {
    return (
      <button
        onClick={onEditClick}
        className="border border-gray-600 text-white px-4 py-1 rounded-full mt-2"
      >
        Edit Profile
      </button>
    );
  }
  let buttonText = "Follow";
  if (requestSent) buttonText = "Requested";
  else if (isFollowing) buttonText = "Following";

  const handleClick = () => {
    if (requestSent) {
      onWithdrawRequest();
    } else {
      onFollowToggle();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`mt-4 px-5 py-1.5 rounded-full font-bold transition ${
        isFollowing
          ? "border border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white"
          : requestSent
          ? "border border-gray-500 text-gray-500 hover:bg-gray-600 hover:text-white"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {buttonText}
    </button>
  );
};

export default FollowButton;

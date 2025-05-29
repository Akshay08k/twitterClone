const ProfileInfo = ({ userProfile }) => (
  <div className="mt-3 space-y-4">
    <div>
      <div className="flex items-center gap-1">
        <h2 className="text-xl font-bold">{userProfile.name}</h2>
      </div>
      <p className="text-gray-500">{userProfile.handle}</p>
    </div>

    <p className="whitespace-pre-line">{userProfile.bio}</p>

    <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-500">
      {userProfile.location && (
        <span className="flex items-center gap-1">
          📍 {userProfile.location}
        </span>
      )}
      {userProfile.website && (
        <a
          href={`https://${userProfile.website}`}
          className="flex items-center gap-1 text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 {userProfile.website}
        </a>
      )}
      <span className="flex items-center gap-1">
        Joined {userProfile.joinDate}
      </span>
    </div>

    <div className="flex gap-4">
      <span className="hover:underline">
        <span className="font-bold">{userProfile.following}</span>{" "}
        <span className="text-gray-500">Following</span>
      </span>
      <span className="hover:underline">
        <span className="font-bold">{userProfile.followers}</span>{" "}
        <span className="text-gray-500">Followers</span>
      </span>
    </div>
  </div>
);

export default ProfileInfo;

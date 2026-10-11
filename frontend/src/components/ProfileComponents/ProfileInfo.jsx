import { BadgeCheck } from "lucide-react";

const ProfileInfo = ({ userProfile }) => (
  <div className="mt-3 space-y-4">
    <div>
      <div className="flex items-center gap-1.5">
        <h2 className="text-xl font-bold">{userProfile.username}</h2>
        {(userProfile.isVerified || userProfile.isPremium) && (
          <BadgeCheck
            className={`w-5 h-5 fill-current shrink-0 ${
              userProfile.verifiedBadgeType === "gold" || userProfile.premiumTier === "premium_plus"
                ? "text-[#e2b714]"
                : "text-[#1d9bf0]"
            }`}
          />
        )}
      </div>
      <p className="text-gray-500">@{userProfile.userHandle}</p>
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

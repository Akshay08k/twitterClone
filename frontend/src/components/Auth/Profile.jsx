// ProfilePage.jsx
import { useState } from "react";
import axios from "axios";
import {
  LocationIcon,
  LinkIcon,
  CalendarIcon,
  ReplyIcon,
  RetweetIcon,
  LikeIcon,
  ShareIcon,
  BackArrowIcon,
  MoreIcon,
  VerifiedIcon,
} from "../../components/Icons/Icons.jsx";
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("tweets");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const loadUserProfile = async () => {
    try {
      const response = await axios.get("http://localhost:3000/user/me", {
        withCredentials: true,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
      return response.data;
    }
  };
  loadUserProfile();
  const userProfile = {
    name: "Akshay Komale",
    handle: "@johndoe",
    bio: "Software Developer | React Enthusiast |\nBuilding amazing things with code 💻\nExploring new technologies 🚀",
    location: "India",
    website: "www.akshaykomale.in",
    joinDate: loadUserProfile.createdAt,
    following: 0,
    followers: "100K",
    verified: true,
    profileImage: "https://placehold.co/400",
    bannerImage: "https://placehold.co/900",
    tweets: 108,
  };

  const tweets = [
    {
      id: 1,
      content:
        "Just deployed my latest React project! 🚀 The new features include real-time updates and a completely redesigned UI. Check it out! #webdev #coding",
      likes: 45,
      retweets: 5,
      replies: 3,
      timestamp: "2h",
      images: ["https://placehold.co/400x300"],
    },
    {
      id: 2,
      content:
        "Just deployed my latest React project! 🚀 The new features include real-time updates and a completely redesigned UI. Check it out! #webdev #coding",
      likes: 45,
      retweets: 5,
      replies: 3,
      timestamp: "2h",
      images: ["https://placehold.co/400x300"],
    },
    {
      id: 3,
      content:
        "Just deployed my latest React project! 🚀 The new features include real-time updates and a completely redesigned UI. Check it out! #webdev #coding",
      likes: 45,
      retweets: 5,
      replies: 3,
      timestamp: "2h",
      images: ["https://placehold.co/400x300"],
    },
    {
      id: 4,
      content:
        "Just deployed my latest React project! 🚀 The new features include real-time updates and a completely redesigned UI. Check it out! #webdev #coding",
      likes: 45,
      retweets: 5,
      replies: 3,
      timestamp: "2h",
      images: ["https://placehold.co/400x300"],
    },
    // Add more tweets...
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-black/75 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-screen-md mx-auto px-4 py-2">
          <div className="flex items-center gap-6">
            <button className="p-2 rounded-full hover:bg-gray-800/60 transition">
              <BackArrowIcon />
            </button>
            <div>
              <h1 className="font-bold text-xl leading-tight">
                {userProfile.name}
              </h1>
              <p className="text-gray-500 text-sm">
                {userProfile.tweets.toLocaleString()} Tweets
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-md mx-auto">
        {/* Banner */}
        <div className="aspect-[3/1] relative bg-gray-800">
          <img
            src={userProfile.bannerImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Section */}
        <div className="px-4">
          {/* Profile Image & Edit Button */}
          <div className="flex justify-between items-start relative">
            <div className="-mt-[10%]">
              <img
                src={userProfile.profileImage}
                alt=""
                className="w-32 h-32 rounded-full border-4 border-black aspect-square object-cover"
              />
            </div>
            <button
              onClick={() => {
                // console.log("Button clicked");
              }}
              className="mt-4 px-5 py-1.5 border border-gray-500 rounded-full font-bold hover:bg-gray-900/60 transition
            "
            >
              Edit profile
            </button>
          </div>

          {/* Profile Info */}
          <div className="mt-3 space-y-4">
            {/* Name and Verification */}
            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-xl font-bold">{userProfile.name}</h2>
                {userProfile.verified && <VerifiedIcon />}
              </div>
              <p className="text-gray-500">{userProfile.handle}</p>
            </div>

            {/* Bio */}
            <p className="whitespace-pre-line">{userProfile.bio}</p>

            {/* Profile Metadata */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-500">
              {userProfile.location && (
                <span className="flex items-center gap-1">
                  <LocationIcon /> {userProfile.location}
                </span>
              )}
              {userProfile.website && (
                <a
                  href={`https://${userProfile.website}`}
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                  <LinkIcon /> {userProfile.website}
                </a>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon /> {userProfile.joinDate}
              </span>
            </div>

            {/* Following/Followers */}
            <div className="flex gap-4">
              <a href="#" className="hover:underline">
                <span className="font-bold">
                  {userProfile.following.toLocaleString()}
                </span>
                <span className="text-gray-500"> Following</span>
              </a>
              <a href="#" className="hover:underline">
                <span className="font-bold">
                  {userProfile.followers.toLocaleString()}
                </span>
                <span className="text-gray-500"> Followers</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex mt-4 border-b border-gray-800">
          {["Tweets", "Replies", "Media", "Likes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`flex-1 py-4 hover:bg-gray-900/40 transition relative
                ${activeTab === tab.toLowerCase() ? "font-bold" : ""}
              `}
            >
              {tab}
              {activeTab === tab.toLowerCase() && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
              )}
            </button>
          ))}
        </nav>

        {/* Tweets Feed */}
        <div className="divide-y divide-gray-800">
          {tweets.map((tweet) => (
            <article
              key={tweet.id}
              className="p-4 hover:bg-gray-900/40 transition cursor-pointer"
            >
              <div className="flex gap-4">
                <img
                  src={userProfile.profileImage}
                  alt=""
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  {/* Tweet Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold truncate">
                      {userProfile.name}
                    </span>
                    {userProfile.verified && <VerifiedIcon />}
                    <span className="text-gray-500 truncate">
                      {userProfile.handle}
                    </span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">{tweet.timestamp}</span>
                    <button className="ml-auto p-1 rounded-full hover:bg-blue-500/20 hover:text-blue-500 transition">
                      <MoreIcon />
                    </button>
                  </div>

                  {/* Tweet Content */}
                  <p className="mt-2 break-words">{tweet.content}</p>

                  {/* Tweet Images */}
                  {tweet.images?.length > 0 && (
                    <div className="mt-3 rounded-2xl overflow-hidden">
                      <img
                        src={tweet.images[0]}
                        alt=""
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Tweet Actions */}
                  <div className="flex justify-between mt-4 max-w-md text-gray-500">
                    <button className="group flex items-center gap-2 hover:text-blue-500">
                      <span className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <ReplyIcon />
                      </span>
                      <span>{tweet.replies}</span>
                    </button>
                    <button className="group flex items-center gap-2 hover:text-green-500">
                      <span className="p-2 rounded-full group-hover:bg-green-500/10">
                        <RetweetIcon />
                      </span>
                      <span>{tweet.retweets}</span>
                    </button>
                    <button className="group flex items-center gap-2 hover:text-pink-500">
                      <span className="p-2 rounded-full group-hover:bg-pink-500/10">
                        <LikeIcon />
                      </span>
                      <span>{tweet.likes}</span>
                    </button>
                    <button className="group p-2 rounded-full hover:text-blue-500 hover:bg-blue-500/10">
                      <ShareIcon />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "../contexts/axios.js";
import Navbar from "./Navbar.jsx";
import { useParams } from "react-router";
import Post from "./Posts.jsx";

const VisitingProfile = () => {
  const { username } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const reduxUser = useSelector((state) => state.user);
  const isCurrentUser = reduxUser.username === username;

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axios.get(`/user/profile/${username}`);
        const userData = response.data.user;
        setUserProfile({
          _id: userData._id,
          name: userData.username,
          handle: "@" + userData.username.trim(),
          bio: userData.bio || "X User",
          location: userData.location || "",
          website: userData.website || "",
          joinDate: new Date(userData.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          following: response.data.userMeta.followingCount || 0,
          followers: response.data.userMeta.followersCount || 0,
          profileImage: userData.avatar || "/default-avatar.png",
          bannerImage:
            userData.bannerImage ||
            "http://res.cloudinary.com/dbwt5yere/image/upload/v1739381440/f7k5uhjq6nxdimn1tq5s.png",
          tweets: response.data.posts || [],
          tweetsCount: response.data.posts?.length || 0,
        });

        const followRes = await axios.post(
          `/follow/isfollwing/${userData._id}`
        );
        const isFollowingUser = followRes.data.data;
        setIsFollowing(isFollowingUser);
      } catch (error) {
        console.error("Failed to load profile or follow status:", error);
      }
    };

    if (username) {
      loadUserProfile();
    }
  }, [username]);
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`follow/remove/${userProfile._id}`);
        setUserProfile((prev) => ({
          ...prev,
          followers: +prev.followers - 1,
        }));
      } else {
        await axios.post(`follow/create/${userProfile._id}`);
        setUserProfile((prev) => ({
          ...prev,
          followers: +prev.followers + 1,
        }));
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  if (!userProfile) {
    return <div className="text-white text-center p-6">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white mt-16">
        <header className="sticky top-0 z-40 bg-black/75 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-screen-md mx-auto px-4 py-2">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="font-bold text-xl leading-tight">
                  {userProfile.name}
                </h1>
                <p className="text-gray-500 text-sm">
                  {userProfile.tweetsCount || "0"} Tweets
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-screen-md mx-auto">
          <div className="aspect-[3/1] relative bg-gray-800">
            <img
              src={userProfile.bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="px-4">
            <div className="flex justify-between items-start relative">
              <div className="-mt-[10%]">
                <img
                  src={userProfile.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-black aspect-square object-cover"
                />
              </div>
              {isCurrentUser ? (
                <button
                  className="mt-4 px-5 py-1.5 border border-gray-500 rounded-full font-bold hover:bg-gray-900/60 transition"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit profile
                </button>
              ) : (
                <button
                  className={`mt-4 px-5 py-1.5 rounded-full font-bold transition ${
                    isFollowing
                      ? "border border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

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

            {/* User posts */}
            <section className="mt-6">
              {Array.isArray(userProfile.tweets) &&
              userProfile.tweets.length > 0 ? (
                userProfile.tweets.map((post) => {
                  const postWithUser = { ...post, user: userProfile };
                  return <Post key={post._id} post={postWithUser} />;
                })
              ) : (
                <p className="text-gray-500 p-4">No posts to display</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default VisitingProfile;

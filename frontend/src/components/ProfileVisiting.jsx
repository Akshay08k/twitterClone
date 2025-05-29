import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "../contexts/axios";
import Navbar from "./Navbar";

import Header from "./VisitingProfile/Header";
import Banner from "./VisitingProfile/Banner";
import ProfileImage from "./VisitingProfile/ProfileImage";
import FollowButton from "./VisitingProfile/FollowButton";
import ProfileInfo from "./VisitingProfile/ProfileInfo";
import PostsList from "./VisitingProfile/PostsList";

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
        setIsFollowing(followRes.data.data);
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
        <Header name={userProfile.name} tweetsCount={userProfile.tweetsCount} />
        <main className="max-w-screen-md mx-auto">
          <Banner bannerImage={userProfile.bannerImage} />
          <div className="px-4">
            <div className="flex justify-between items-start relative">
              <ProfileImage profileImage={userProfile.profileImage} />
              <FollowButton
                isCurrentUser={isCurrentUser}
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
                onEditClick={() => console.log("Edit profile")}
              />
            </div>
            <ProfileInfo userProfile={userProfile} />
            <section className="mt-6">
              <PostsList tweets={userProfile.tweets} user={userProfile} />
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default VisitingProfile;

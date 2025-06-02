import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "../contexts/axios";

import Navbar from "./Navbar";
import Header from "./ProfileComponents/Header";
import Banner from "./ProfileComponents/Banner";
import ProfileImage from "./ProfileComponents/ProfileImage";
import FollowButton from "./ProfileComponents/FollowButton";
import ProfileInfo from "./ProfileComponents/ProfileInfo";
import PostsList from "./ProfileComponents/PostsList";

const VisitingProfile = () => {
  const { username } = useParams();
  const reduxUser = useSelector((state) => state.user);
  const isCurrentUser = reduxUser.username === username;

  const [userProfile, setUserProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axios.get(`/user/profile/${username}`);
        const userData = response.data.user;

        setIsPrivate(userData.isPrivate || false);

        setUserProfile({
          _id: userData._id,
          username: userData.username,
          userHandle: userData.userHandle?.trim(),
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
        });

        // Check follow status
        const followRes = await axios.post(
          `/follow/isfollwing/${userData._id}`
        );
        setIsFollowing(followRes.data.data.isFollowing);

        // If private and not following, check for follow request
        if (userData.isPrivate && !followRes.data.isFollowing) {
          const reqStatus = await axios.get(
            `/follow_request/status/${userData._id}`
          );
          if (reqStatus.data.status === "pending") {
            setRequestSent(true);
          }
        }

        // Only load posts if not private or already following
        if (!userData.isPrivate || followRes.data.data.isFollowing) {
          const postsRes = await axios.get(`/posts/user/${userData._id}`);

          setTweets(postsRes.data.data);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    if (username) loadUserProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!userProfile || isCurrentUser) return;

    try {
      if (isFollowing) {
        await axios.delete(`follow/remove/${userProfile._id}`);
        setUserProfile((prev) => ({ ...prev, followers: +prev.followers - 1 }));
        setIsFollowing(false);
      } else {
        if (isPrivate) {
          if (requestSent) {
            const res = await axios.delete(
              `/follow_request/withdraw/${userProfile._id}`
            );
            if (res.data.success) {
              setRequestSent(false);
            }
          } else {
            const res = await axios.post(
              `/follow_request/send/${userProfile._id}`
            );
            if (res.data.requestSent) {
              setRequestSent(true);
            }
          }
        } else {
          await axios.post(`follow/create/${userProfile._id}`);
          setUserProfile((prev) => ({
            ...prev,
            followers: +prev.followers + 1,
          }));
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (!userProfile) {
    return <div className="text-white text-center p-6">Loading...</div>;
  }

  const isBlockedView = isPrivate && !isFollowing;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white mt-16">
        <Header name={userProfile.username} tweetsCount={tweets.length} />
        <main className="max-w-screen-md mx-auto relative">
          <Banner bannerImage={userProfile.bannerImage} />
          <div className="px-4 relative">
            <div className="flex justify-between items-start relative">
              <ProfileImage profileImage={userProfile.profileImage} />
              <FollowButton
                isCurrentUser={isCurrentUser}
                isFollowing={isFollowing}
                requestSent={requestSent}
                isPrivate={isPrivate}
                onFollowToggle={handleFollowToggle}
                onEditClick={() => console.log("Edit profile")}
              />
            </div>

            {isBlockedView ? (
              <div className="text-center mt-10 text-gray-400 select-none">
                <p className="text-xl font-semibold mb-2">
                  This account is Private
                </p>
                {requestSent ? (
                  <p className="text-sm">Follow request sent</p>
                ) : (
                  <p className="text-sm">Follow them to see their posts</p>
                )}
              </div>
            ) : (
              <>
                <ProfileInfo userProfile={userProfile} />
                <section className="mt-6">
                  <PostsList tweets={tweets} user={userProfile} />
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default VisitingProfile;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../contexts/axios";
import toast from "react-hot-toast";
import { MoreHorizontal, ShieldAlert, UserX, UserCheck, ArrowLeft, Link2 } from "lucide-react";

import Header from "./ProfileComponents/Header";
import Banner from "./ProfileComponents/Banner";
import ProfileImage from "./ProfileComponents/ProfileImage";
import FollowButton from "./ProfileComponents/FollowButton";
import ProfileInfo from "./ProfileComponents/ProfileInfo";
import PostsList from "./ProfileComponents/PostsList";

const VisitingProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.user);
  const isCurrentUser = reduxUser.username === username;

  const [userProfile, setUserProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockingMe, setIsBlockingMe] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlockingAction, setIsBlockingAction] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axios.get(`/user/profile/${username}`);
        const data = response.data;
        const userData = data.user;

        setIsBlockedByMe(!!data.isBlockedByMe);
        setIsBlockingMe(!!data.isBlockingMe);
        setIsPrivate(userData.isPrivate || false);

        setUserProfile({
          _id: userData._id,
          username: userData.username,
          userHandle: userData.userHandle?.trim(),
          bio: userData.bio || "X User",
          location: userData.location || "",
          website: userData.website || "",
          joinDate: new Date(userData.createdAt || Date.now()).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          following: data.userMeta?.followingCount || 0,
          followers: data.userMeta?.followersCount || 0,
          profileImage: userData.avatar || "/default-avatar.png",
          bannerImage:
            userData.bannerImage ||
            "http://res.cloudinary.com/dbwt5yere/image/upload/v1739381440/f7k5uhjq6nxdimn1tq5s.png",
        });

        // If blocked by either, skip follow checks and posts
        if (data.isBlockingMe || data.isBlockedByMe) {
          setTweets([]);
          return;
        }

        const followRes = await axios.post(`/follow/isfollwing/${userData._id}`);
        setIsFollowing(followRes.data.data.isFollowing);

        if (userData.isPrivate && !followRes.data.data.isFollowing) {
          const reqStatus = await axios.get(`/follow_request/status/${userData._id}`);
          if (reqStatus.data.status === "pending") {
            setRequestSent(true);
          }
        }

        if (!userData.isPrivate || followRes.data.data.isFollowing) {
          const postsRes = await axios.get(`/posts/user/${userData._id}`);
          setTweets(postsRes.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    if (username) loadUserProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!userProfile || isCurrentUser || isBlockedByMe || isBlockingMe) return;

    try {
      if (isFollowing) {
        await axios.delete(`follow/remove/${userProfile._id}`);
        setUserProfile((prev) => ({ ...prev, followers: Math.max(0, +prev.followers - 1) }));
        setIsFollowing(false);
      } else {
        if (isPrivate) {
          if (requestSent) {
            const res = await axios.delete(`/follow_request/withdraw/${userProfile._id}`);
            if (res.data.success) {
              setRequestSent(false);
            }
          } else {
            const res = await axios.post(`/follow_request/send/${userProfile._id}`);
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
      toast.error(error.response?.data?.message || "Failed to update follow status");
    }
  };

  const handleBlockUser = async () => {
    if (!userProfile || isBlockingAction) return;
    setIsBlockingAction(true);
    try {
      await axios.post(`/user/block/${userProfile._id}`);
      setIsBlockedByMe(true);
      setIsFollowing(false);
      setRequestSent(false);
      setTweets([]);
      setShowBlockModal(false);
      setIsMenuOpen(false);
      toast.success(`Blocked @${userProfile.username}`);
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error(error.response?.data?.message || "Failed to block user");
    } finally {
      setIsBlockingAction(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!userProfile || isBlockingAction) return;
    setIsBlockingAction(true);
    try {
      await axios.post(`/user/unblock/${userProfile._id}`);
      setIsBlockedByMe(false);
      toast.success(`Unblocked @${userProfile.username}`);
      // Refresh posts if public
      if (!isPrivate) {
        const postsRes = await axios.get(`/posts/user/${userProfile._id}`);
        setTweets(postsRes.data.data || []);
      }
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error(error.response?.data?.message || "Failed to unblock user");
    } finally {
      setIsBlockingAction(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1d9bf0] border-t-transparent"></div>
      </div>
    );
  }

  const isPrivateRestricted = isPrivate && !isFollowing && !isCurrentUser;

  return (
    <div className="w-full min-h-screen pb-16">
      <Header name={userProfile.username} tweetsCount={tweets.length} />

      <div className="relative">
        <Banner bannerImage={userProfile.bannerImage} />

        <div className="px-4 relative">
          <div className="flex justify-between items-start relative">
            <ProfileImage profileImage={userProfile.profileImage} />

            <div className="flex items-center space-x-2 mt-3">
              {/* 3-dots More Options Menu (only when visiting others) */}
              {!isCurrentUser && !isBlockingMe && (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-full border border-gray-600 text-white hover:bg-white/10 transition-colors"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-52 bg-black border border-[#24272c] rounded-2xl shadow-card py-1.5 z-30 animate-fadeIn"
                    >
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setIsMenuOpen(false);
                          toast.success("Profile link copied");
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#16181c] text-left transition-colors"
                      >
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <span>Copy link to profile</span>
                      </button>

                      {isBlockedByMe ? (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleUnblockUser();
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-[#1d9bf0] hover:bg-[#1d9bf0]/10 text-left transition-colors font-medium"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Unblock @{userProfile.username}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setShowBlockModal(true);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 text-left transition-colors font-medium"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Block @{userProfile.username}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {isBlockedByMe ? (
                <button
                  onClick={handleUnblockUser}
                  className="px-5 py-2 rounded-full font-bold text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                  Blocked
                </button>
              ) : isBlockingMe ? null : (
                <FollowButton
                  isCurrentUser={isCurrentUser}
                  isFollowing={isFollowing}
                  requestSent={requestSent}
                  isPrivate={isPrivate}
                  onFollowToggle={handleFollowToggle}
                  onEditClick={() => navigate("/settings")}
                />
              )}
            </div>
          </div>

          {/* User Display Info */}
          <div className="mt-3">
            <h1 className="text-xl font-bold text-white leading-tight">
              {userProfile.username}
            </h1>
            <p className="text-gray-500 text-sm">
              @{userProfile.userHandle || userProfile.username}
            </p>
          </div>

          {/* ========================================= */}
          {/* STATE 1: Visited User Has Blocked Current User */}
          {/* ========================================= */}
          {isBlockingMe ? (
            <div className="text-center mt-12 py-16 px-6 max-w-md mx-auto space-y-3">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-2xl font-black text-white">You're blocked</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                You cannot follow or view @{userProfile.username}'s posts, and you cannot receive notifications from @{userProfile.username}.
              </p>
            </div>
          ) : isBlockedByMe ? (
            /* ========================================= */
            /* STATE 2: Current User Has Blocked Visited User */
            /* ========================================= */
            <div className="text-center mt-12 py-16 px-6 max-w-md mx-auto space-y-4">
              <UserX className="w-12 h-12 text-gray-500 mx-auto" />
              <h2 className="text-2xl font-black text-white">
                You blocked @{userProfile.username}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                You will not see posts, mentions, or notifications from @{userProfile.username}.
              </p>
              <button
                onClick={handleUnblockUser}
                disabled={isBlockingAction}
                className="px-6 py-2.5 bg-white hover:bg-gray-200 text-black font-bold text-sm rounded-full transition-all duration-200 active:scale-95"
              >
                {isBlockingAction ? "Unblocking..." : `Unblock @${userProfile.username}`}
              </button>
            </div>
          ) : isPrivateRestricted ? (
            /* ========================================= */
            /* STATE 3: Private Account Restricted View   */
            /* ========================================= */
            <div className="text-center mt-10 py-16 text-gray-400 select-none space-y-2">
              <p className="text-xl font-bold text-white">This account is Private</p>
              {requestSent ? (
                <p className="text-sm">Follow request sent. Wait for approval to see their posts.</p>
              ) : (
                <p className="text-sm">Follow them to see their posts.</p>
              )}
            </div>
          ) : (
            /* ========================================= */
            /* STATE 4: Normal Profile & Tweets Feed     */
            /* ========================================= */
            <>
              <ProfileInfo userProfile={userProfile} />
              <section className="mt-4 border-t border-[#24272c]">
                <PostsList
                  tweets={tweets}
                  user={userProfile}
                  onPostDeleted={(id) => setTweets((prev) => prev.filter((t) => t._id !== id))}
                />
              </section>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Blocking User */}
      {showBlockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowBlockModal(false)}
        >
          <div
            className="bg-black border border-[#24272c] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black text-white">
              Block @{userProfile.username}?
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              They will no longer be able to follow you or view your posts, and you will not see posts or notifications from @{userProfile.username}.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleBlockUser}
                disabled={isBlockingAction}
                className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors active:scale-95"
              >
                {isBlockingAction ? "Blocking..." : "Block"}
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                disabled={isBlockingAction}
                className="w-full py-2.5 rounded-full bg-transparent hover:bg-white/10 text-white font-bold text-sm border border-[#24272c] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitingProfile;

import { useState, useEffect } from "react";

import axios from "../../contexts/axios";
import usePostSocketSync from "../../utils/usePostSync.js";

import Navbar from "../Navbar.jsx";
import EditProfile from "../Popups/EditProfile.jsx";
import Header from "../ProfileComponents/Header.jsx";
import Banner from "../ProfileComponents/Banner.jsx";
import ProfileImage from "../ProfileComponents/ProfileImage.jsx";
import EditButton from "../ProfileComponents/EditButton.jsx";
import ProfileInfo from "../ProfileComponents/ProfileInfo.jsx";
import PostsList from "../ProfileComponents/PostsList.jsx";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axios.get("/user/me");
        const userData = response.data.user;

        setUserProfile({
          _id: userData._id,
          username: userData.username,
          userHandle: "@" + userData.userHandle.trim(),
          bio: userData.bio || "X User",
          location: userData.location || "",
          website: userData.website || "",
          joinDate: new Date(userData.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          following: userData.followingCount || 0,
          followers: userData.followerCount || 0,
          profileImage: userData.avatar,
          bannerImage:
            userData.bannerImage ||
            "http://res.cloudinary.com/dbwt5yere/image/upload/v1739381440/f7k5uhjq6nxdimn1tq5s.png",
        });

        const postsResponse = await axios.get(`/posts/user/${userData._id}`);

        const postsWithUser = (postsResponse.data.data || []).map((post) => ({
          ...post,
          user: {
            _id: userData._id,
            username: userData.username,
            avatar: userData.avatar,
            profileImage: userData.avatar,
            userHandle: userData.userHandle,
          },
        }));

        setPosts(postsWithUser);
      } catch (error) {
        console.error(error);
      }
    };

    loadUserProfile();
  }, []);
  usePostSocketSync({
    onNewPost: (newPost) => {
      if (newPost.user._id === userProfile._id) {
        setPosts((prev) => [newPost, ...prev]);
      }
    },
    onPostDeleted: (deletedId) => {
      setPosts((prev) => prev.filter((post) => post._id !== deletedId));
    },
  });

  const handleSaveProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    setShowEditModal(false);
  };

  if (!userProfile) {
    return <div className="text-white text-center p-6">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white mt-16">
        <Header username={userProfile.username} tweets={posts.length} />
        <main className="max-w-screen-md mx-auto">
          <Banner bannerImage={userProfile.bannerImage} />
          <div className="px-4">
            <div className="flex justify-between items-start relative">
              <ProfileImage profileImage={userProfile.profileImage} />
              <EditButton onClick={() => setShowEditModal(true)} />
            </div>
            <ProfileInfo userProfile={userProfile} />
            <section className="mt-6">
              <PostsList tweets={posts} user={userProfile} editable={true} />
            </section>
          </div>
        </main>
      </div>

      {showEditModal && (
        <EditProfile
          userProfile={userProfile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
};

export default Profile;

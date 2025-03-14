import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar.jsx";
import EditProfile from "../Popups/EditProfile.jsx";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user/me", {
          withCredentials: true,
        });

        const userData = response.data.data;

        setUserProfile({
          name: userData.username,
          handle: "@" + userData.username.trim(),
          bio: userData.bio || "X User",
          location: userData.location || "",
          website: userData.website || "",
          joinDate: new Date(userData.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          following: userData.following || "0",
          followers: userData.followers || "0",
          profileImage: userData.avatar,
          bannerImage:
            userData.bannerImage ||
            "http://res.cloudinary.com/dbwt5yere/image/upload/v1739381440/f7k5uhjq6nxdimn1tq5s.png",
          tweets: userData.tweets || "0",
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadUserProfile();
  }, []);

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
        <header className="sticky top-0 z-40 bg-black/75 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-screen-md mx-auto px-4 py-2">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="font-bold text-xl leading-tight">
                  {userProfile.name}
                </h1>
                <p className="text-gray-500 text-sm">
                  {userProfile.tweets || "0"} Tweets
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-screen-md mx-auto">
          <div className="aspect-[3/1] relative bg-gray-800">
            <img
              src={userProfile.bannerImage}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="px-4">
            <div className="flex justify-between items-start relative">
              <div className="-mt-[10%]">
                <img
                  src={userProfile.profileImage}
                  alt=""
                  className="w-32 h-32 rounded-full border-4 border-black aspect-square object-cover"
                />
              </div>
              <button
                className="mt-4 px-5 py-1.5 border border-gray-500 rounded-full font-bold hover:bg-gray-900/60 transition"
                onClick={() => setShowEditModal(true)}
              >
                Edit profile
              </button>
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
                  >
                    🔗 {userProfile.website}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  Joined {userProfile.joinDate}
                </span>
              </div>

              <div className="flex gap-4">
                <a href="#" className="hover:underline">
                  <span className="font-bold">
                    {userProfile.following || "0"}
                  </span>
                  <span className="text-gray-500"> Following</span>
                </a>
                <a href="#" className="hover:underline">
                  <span className="font-bold">
                    {userProfile.followers || "0"}
                  </span>
                  <span className="text-gray-500"> Followers</span>
                </a>
              </div>
            </div>
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

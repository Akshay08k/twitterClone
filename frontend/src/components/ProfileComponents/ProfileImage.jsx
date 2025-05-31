const ProfileImage = ({ profileImage }) => (
  <div className="-mt-[10%]">
    <img
      src={profileImage}
      alt="Profile"
      className="w-32 h-32 rounded-full border-4 border-black aspect-square object-cover"
    />
  </div>
);

export default ProfileImage;

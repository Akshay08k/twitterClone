import { useState } from "react";

function EditProfile({ userProfile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: userProfile.name,
    bio: userProfile.bio,
    location: userProfile.location || "",
    website: userProfile.website || "",
    profileImage: userProfile.profileImage,
    bannerImage: userProfile.bannerImage,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-8">
            <button
              onClick={onClose}
              className="text-xl p-2 rounded-full hover:bg-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold">Edit profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition"
          >
            Save
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-2">
            <div className="aspect-[3/1] relative bg-gray-800">
              <img
                src={formData.bannerImage}
                alt=""
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50 opacity-0 hover:opacity-100 transition">
                <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                  📷
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "bannerImage")}
                />
              </label>
            </div>

            <div className="px-4 -mt-16 relative">
              <div className="relative inline-block">
                <img
                  src={formData.profileImage}
                  alt=""
                  className="w-32 h-32 rounded-full border-4 border-black aspect-square object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50 opacity-0 hover:opacity-100 transition rounded-full">
                  <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                    📷
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "profileImage")}
                  />
                </label>
              </div>
            </div>

            <div className="p-4 space-y-4 mt-12">
              <div>
                <label className="block text-gray-500 text-sm mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength="50"
                  className="w-full bg-black border border-gray-800 rounded-md p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength="160"
                  rows="3"
                  className="w-full bg-black border border-gray-800 rounded-md p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength="30"
                  className="w-full bg-black border border-gray-800 rounded-md p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-1">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-800 rounded-md p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;

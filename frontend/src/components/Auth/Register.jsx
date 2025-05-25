import React, { useState } from "react";
import axios from "../../contexts/axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confpassword: "",
    birthdate: " ",
  });

  const [avatar, setAvatar] = useState(null);
  const checkConfPassword = (e) => {
    if (formData.password !== formData.confpassword) {
      e.target.style.borderColor = "red";
    }
  };
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const avatar = e.target.files[0];
      setAvatar(avatar);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();
  };

  const sendData = async () => {
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("confpassword", formData.confpassword);
    data.append("birthdate", formData.birthdate);
    if (avatar) {
      data.append("avatar", avatar);
    }

    try {
      const res = await axios.post("/user/register", data);

      if (res.status === 200) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-white text-3xl font-bold mb-8 text-center">
          Create your account
        </h1>

        <div className="bg-black p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              className="w-full p-4 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] placeholder-gray-600"
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Username"
              required
            />

            <input
              className="w-full p-4 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] placeholder-gray-600"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email"
              required
            />

            <input
              className="w-full p-4 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] placeholder-gray-600"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Password"
              required
            />

            <input
              className="w-full p-4 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] placeholder-gray-600"
              type="password"
              name="confpassword"
              value={formData.confpassword}
              onChange={(e) =>
                setFormData({ ...formData, confpassword: e.target.value })
              }
              onBlur={checkConfPassword}
              onInput={(e) => {
                e.target.style.borderColor = "gray";
              }}
              placeholder="Confirm password"
              required
            />

            <div>
              {formData.password !== formData.confpassword && (
                <p className="text-red-500">Passwords do not match</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-gray-400 text-sm mb-1">
                Date of birth
              </label>
              <input
                className="w-full p-4 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2]"
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={(e) =>
                  setFormData({ ...formData, birthdate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-400 text-sm mb-1">
                Profile picture
              </label>
              <input
                className="w-full p-4 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1DA1F2] file:text-white hover:file:bg-[#1a91da]"
                type="file"
                name="avatar"
                onChange={handleAvatarChange}
                required
              />
            </div>

            <button
              className="w-full p-3 bg-[#1DA1F2] text-white rounded-full font-bold text-lg hover:bg-[#1a91da] transition duration-200 mt-6"
              type="submit"
            >
              Sign up
            </button>
          </form>

          <p className="text-gray-600 text-center mt-6 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-[#1DA1F2] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

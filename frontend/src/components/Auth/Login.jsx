import React, { useState } from "react";
import axios from "../../contexts/axios";
import { useAuth } from "../../contexts/AuthContext";

import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser, fetchUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/user/login", formData);
      await fetchUser();
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-[380px] space-y-8">
        {/* Twitter Logo */}
        <div className="flex justify-center mb-8">
          <svg
            viewBox="0 0 24 24"
            className="h-12 w-12 text-[#1DA1F2]"
            fill="currentColor"
          >
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
          </svg>
        </div>

        <h1 className="text-white text-center text-2xl font-bold mb-12">
          Sign in to Twitter
        </h1>

        {error && (
          <div className="bg-red-900 bg-opacity-40 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input
              className="w-full p-4 bg-transparent border border-gray-700 rounded-md text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] placeholder-gray-600 text-lg"
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
              className="w-full p-4 bg-transparent border border-gray-700 rounded-md text-white focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] placeholder-gray-600 text-lg"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Password"
              required
            />
          </div>

          <button
            className={`w-full p-3.5 bg-[#1DA1F2] text-white rounded-full font-bold text-lg hover:bg-[#1a91da] transition-colors duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex flex-col items-center space-y-4 pt-4">
          <a href="#" className="text-[#1DA1F2] hover:underline">
            Forgot password?
          </a>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Don't have an account?</span>
            <a href="/register" className="text-[#1DA1F2] hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const sendData = async () => {
    setLoading(true);
    setError(""); // Reset error before a new attempt

    try {
      const res = await axios.post(
        "http://localhost:3000/user/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        login();
        navigate("/home");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendData();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-white text-3xl font-bold mb-8 text-center">
          Sign in to Askify
        </h1>

        <div className="bg-black p-6 rounded-2xl">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form method="post" className="space-y-5" onSubmit={handleSubmit}>
            <div>
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
            </div>

            <div>
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
            </div>

            <button
              className={`w-full p-3 bg-[#1DA1F2] text-white rounded-full font-bold text-lg hover:bg-[#1a91da] transition duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex justify-center space-x-4">
            <a href="#" className="text-[#1DA1F2] hover:underline text-sm">
              Forgot password?
            </a>
            <span className="text-gray-600">·</span>
            <a
              href="/register"
              className="text-[#1DA1F2] hover:underline text-sm"
            >
              Sign up for X
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

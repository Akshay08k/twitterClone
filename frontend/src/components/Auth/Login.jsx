import React, { useState } from "react";
import axios from "../../contexts/axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { setUser, fetchUser } = useAuth();

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value) && value.length > 0) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (value.length > 0 && value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);

    // Clear server error when user starts typing
    if (errors.server) {
      const newErrors = { ...errors };
      delete newErrors.server;
      setErrors(newErrors);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate fields before submission
    validateField("email", formData.email);
    validateField("password", formData.password);

    // Check for validation errors
    const hasErrors = Object.values(errors).some(
      (error) => error !== null && error !== undefined
    );
    if (hasErrors) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/user/login", formData);

      // Show success toast
      toast.success("Successfully signed in! Welcome back.", {
        duration: 2000,
        style: {
          background: "#1DA1F2",
          color: "white",
        },
      });

      await fetchUser();
      setUser(res.data.user);

      // Small delay to show success message
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);

      let errorMessage = "Invalid credentials or server error";

      if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setErrors({ server: errorMessage });

      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
      });
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    !Object.values(errors).some(
      (error) => error !== null && error !== undefined
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-8">
      <Toaster position="top-center" />

      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">𝕏</span>
            </div>
          </div>

          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Sign in to X</h1>
            <p className="text-gray-400 text-sm">
              Welcome back! Please sign in to continue
            </p>
          </div>
        </div>

        <div className="bg-black border border-gray-800 p-8 rounded-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <input
                className={`w-full p-4 bg-black border rounded-lg text-white focus:outline-none focus:ring-2 placeholder-gray-500 transition-colors text-lg ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-700 focus:border-[#1DA1F2] focus:ring-[#1DA1F2]/20"
                }`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                className={`w-full p-4 bg-black border rounded-lg text-white focus:outline-none focus:ring-2 placeholder-gray-500 transition-colors text-lg pr-12 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-700 focus:border-[#1DA1F2] focus:ring-[#1DA1F2]/20"
                }`}
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Server Error */}
            {errors.server && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-500 text-sm">{errors.server}</p>
                </div>
              </div>
            )}

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-600 bg-black text-[#1DA1F2] focus:ring-[#1DA1F2] focus:ring-offset-0"
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                className="text-[#1DA1F2] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              className={`w-full p-4 rounded-full font-bold text-lg transition-all duration-200 ${
                loading || !isFormValid
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#1DA1F2] text-white hover:bg-[#1a91da] hover:shadow-lg hover:shadow-[#1DA1F2]/25"
              }`}
              type="submit"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Alternative sign in options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-400">or</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full mt-4 p-4 border border-gray-700 rounded-full text-white font-medium hover:bg-gray-900 transition-colors duration-200"
              onClick={() => toast.info("Google sign-in coming soon!")}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </div>
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-[#1DA1F2] hover:underline font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <a href="/about" className="hover:underline">
              About
            </a>
            <a href="/help" className="hover:underline">
              Help Center
            </a>
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
          </div>
          <p className="text-xs text-gray-600">© 2025 X Corp.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

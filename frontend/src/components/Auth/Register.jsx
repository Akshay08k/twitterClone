import React, { useState } from "react";
import axios from "../../contexts/axios";
import toast, { Toaster } from "react-hot-toast";

const SuccessRegister = () =>
  toast("Successfully registered Redirecting to login...");

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confpassword: "",
    birthdate: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "username":
        if (value.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username =
            "Username can only contain letters, numbers, and underscores";
        } else {
          delete newErrors.username;
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password =
            "Password must contain uppercase, lowercase, and number";
        } else {
          delete newErrors.password;
        }
        // Re-validate confirm password when password changes
        if (formData.confpassword && value !== formData.confpassword) {
          newErrors.confpassword = "Passwords do not match";
        } else if (formData.confpassword && value === formData.confpassword) {
          delete newErrors.confpassword;
        }
        break;
      case "confpassword":
        if (value !== formData.password) {
          newErrors.confpassword = "Passwords do not match";
        } else {
          delete newErrors.confpassword;
        }
        break;
      case "birthdate":
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) {
          newErrors.birthdate = "You must be at least 13 years old";
        } else {
          delete newErrors.birthdate;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: "File size must be less than 5MB" });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, avatar: "Please select an image file" });
        return;
      }

      setAvatar(file);

      // FIXED: Properly remove avatar error by deleting the property
      const newErrors = { ...errors };
      delete newErrors.avatar;
      setErrors(newErrors);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
    });

    // FIXED: Check if there are any actual error messages (not null values)
    const hasErrors = Object.values(errors).some(
      (error) => error !== null && error !== undefined
    );

    if (hasErrors) {
      return;
    }

    setIsLoading(true);
    await sendData();
    setIsLoading(false);
  };

  const sendData = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (avatar) {
      data.append("avatar", avatar);
    }

    try {
      const res = await axios.post("/user/register", data);

      if (res.status === 200) {
        SuccessRegister();
        setTimeout(() => {
          window.location.href = "/login";
        }, 2500);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        setErrors({ ...errors, submit: error.response.data.message });
      } else {
        setErrors({
          ...errors,
          submit: "Registration failed. Please try again.",
        });
      }
    }
  };

  // FIXED: Better logic for checking if form is valid
  const hasValidationErrors = Object.values(errors).some(
    (error) => error !== null && error !== undefined
  );
  const isFormValid =
    formData.username &&
    formData.email &&
    formData.password &&
    formData.confpassword &&
    formData.birthdate &&
    !hasValidationErrors;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <Toaster />
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-xl">𝕏</span>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Join X today</h1>
          <p className="text-gray-400 text-sm">
            Connect with people and discover what's happening
          </p>
        </div>

        <div className="bg-black border border-gray-800 p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-[#1DA1F2] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1a91da] transition-colors">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 15.17l7.59-7.59L19 9l-9 9z" />
                  </svg>
                  <input
                    type="file"
                    name="avatar"
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-400 text-xs mt-2">Add a profile photo</p>
              {errors.avatar && (
                <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <input
                className={`w-full p-4 bg-black border rounded-lg text-white focus:outline-none focus:ring-2 placeholder-gray-500 transition-colors ${
                  errors.username
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-700 focus:border-[#1DA1F2] focus:ring-[#1DA1F2]/20"
                }`}
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                className={`w-full p-4 bg-black border rounded-lg text-white focus:outline-none focus:ring-2 placeholder-gray-500 transition-colors ${
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
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                className={`w-full p-4 bg-black border rounded-lg text-white focus:outline-none focus:ring-2 placeholder-gray-500 transition-colors pr-12 ${
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
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                className={`w-full p-4 bg-black border rounded-lg text-white focus:outline-none focus:ring-2 placeholder-gray-500 transition-colors pr-12 ${
                  errors.confpassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-700 focus:border-[#1DA1F2] focus:ring-[#1DA1F2]/20"
                }`}
                type={showConfPassword ? "text" : "password"}
                name="confpassword"
                value={formData.confpassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowConfPassword(!showConfPassword)}
              >
                {showConfPassword ? (
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
              {errors.confpassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confpassword}
                </p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Date of birth
              </label>
              <input
                className={`w-full p-4 bg-black border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.birthdate
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-700 focus:border-[#1DA1F2] focus:ring-[#1DA1F2]/20"
                }`}
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                required
              />
              {errors.birthdate && (
                <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-500 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* FIXED: Better button logic */}
            <button
              className={`w-full p-4 rounded-full font-bold text-lg transition-all duration-200 ${
                isLoading || !isFormValid
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#1DA1F2] text-white hover:bg-[#1a91da] hover:shadow-lg hover:shadow-[#1DA1F2]/25"
              }`}
              type="submit"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
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
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-gray-500 text-xs text-center mt-6 leading-relaxed">
            By signing up, you agree to the{" "}
            <a href="/terms" className="text-[#1DA1F2] hover:underline">
              Terms of Service
            </a>
            <a href="/privacy" className="text-[#1DA1F2] hover:underline">
              Privacy Policy
            </a>
            , including{" "}
            <a href="/cookies" className="text-[#1DA1F2] hover:underline">
              Cookie Use
            </a>
            .
          </p>

          {/* Login Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Have an account already?{" "}
              <a
                href="/login"
                className="text-[#1DA1F2] hover:underline font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

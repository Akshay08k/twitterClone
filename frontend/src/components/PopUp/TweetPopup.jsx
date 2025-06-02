import React, { useState, useRef, useEffect } from "react";
import axios from "../../contexts/axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
const TweetPopup = ({ isOpen, onClose }) => {
  const reduxUser = useSelector((state) => state.user);
  const [tweet, setTweet] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 280;
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setCharCount(tweet.length);
  }, [tweet]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("description", tweet);
    if (selectedImage) {
      formData.append("postImages", selectedImage);
    }

    try {
      const response = await axios.post("/posts/create", formData);
      if (response.status === 200) {
        setTweet("");
        setSelectedImage(null);
        setImagePreview("");
        toast.success("Tweet Posted Successfully");
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        console.error("Something Went Wrong " + response.data);
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharCountColor = () => {
    const percentage = charCount / MAX_CHARS;
    if (percentage > 1) return "text-red-400";
    if (percentage > 0.9) return "text-red-400";
    if (percentage > 0.8) return "text-yellow-400";
    return "text-gray-500";
  };

  const getProgressBarColor = () => {
    const percentage = charCount / MAX_CHARS;
    if (percentage > 1) return "stroke-red-400";
    if (percentage > 0.9) return "stroke-red-400";
    if (percentage > 0.8) return "stroke-yellow-400";
    return "stroke-blue-400";
  };

  const progressPercentage = Math.min((charCount / MAX_CHARS) * 100, 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <Toaster />
      <div className="relative bg-black w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-800 transform transition-all duration-300 scale-100 animate-in slide-in-from-top-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-800 transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13.414 12l5.293-5.293a1 1 0 00-1.414-1.414L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 101.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12z" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-white">Create Tweet</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <img
                src={reduxUser.avatar}
                alt={reduxUser.name}
                className="w-12 h-12 rounded-full border-2 border-gray-700 ring-2 ring-blue-500 ring-opacity-0 transition-all duration-200 hover:ring-opacity-50"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={tweet}
                  name="description"
                  placeholder="What's happening......?"
                  onChange={(e) => setTweet(e.target.value)}
                  maxLength={MAX_CHARS}
                  className="w-full bg-transparent text-xl text-white placeholder-gray-500 border-none  resize-none min-h-[140px] outline-none"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-700 group">
                  <img
                    src={imagePreview}
                    alt="Tweet image"
                    className="max-h-96 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                    className="absolute top-3 right-3 bg-black bg-opacity-70 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-90 transition-all duration-200 transform hover:scale-110"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13.414 12l5.293-5.293a1 1 0 00-1.414-1.414L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 101.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 bg-opacity-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Image Upload */}
              <label className="cursor-pointer hover:bg-blue-500 hover:bg-opacity-10 p-2.5 rounded-full transition-all duration-200 group">
                <svg
                  className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22h-.003c-.2 0-.393.08-.532.224l-4.317 4.384-1.813-1.806c-.14-.14-.33-.22-.53-.22-.193-.03-.395.08-.535.227L3.5 17.642V4.25c0-.413.337-.75.75-.75zm-.744 16.28l5.418-5.534 6.282 6.254H4.25c-.402 0-.727-.322-.744-.72zm16.244.72h-2.42l-5.007-4.987 3.792-3.85 4.385 4.384v3.703c0 .413-.337.75-.75.75z" />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="flex items-center space-x-4">
              {charCount > 0 && (
                <div className="relative flex items-center">
                  <svg
                    className="w-8 h-8 transform -rotate-90"
                    viewBox="0 0 32 32"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-700"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className={getProgressBarColor()}
                      strokeDasharray={`${progressPercentage * 0.754} 75.4`}
                      style={{ transition: "stroke-dasharray 0.3s ease" }}
                    />
                  </svg>
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${getCharCountColor()}`}
                  >
                    {charCount > MAX_CHARS * 0.9 ? MAX_CHARS - charCount : ""}
                  </span>
                </div>
              )}

              {/* Tweet Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  (!tweet.trim() && !selectedImage) ||
                  charCount > MAX_CHARS ||
                  isSubmitting
                }
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-200 transform ${
                  (tweet.trim() || selectedImage) &&
                  charCount <= MAX_CHARS &&
                  !isSubmitting
                    ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95 shadow-lg"
                    : "bg-blue-500 bg-opacity-50 text-white cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </div>
                ) : (
                  "Tweet"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetPopup;

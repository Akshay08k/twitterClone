import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
const TweetPopup = ({ isOpen, onClose }) => {
  const [tweet, setTweet] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 280;
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
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
    const formData = new FormData();
    formData.append("description", tweet);
    if (selectedImage) {
      formData.append("postImages", selectedImage);
    }

    try {
      const responce = await axios.post(
        "http://localhost:3000/posts/create",
        formData,
        {
          withCredentials: true,
        }
      );
      if (responce.status === 200) {
        console.log(responce.data);
      } else {
        console.error("Something giant error occured " + responce.data);
      }
      setTweet("");
      setSelectedImage(null);
      setImagePreview("");
      onClose();
    } catch (error) {
      console.error("Error posting tweet:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative bg-black w-full max-w-xl rounded-2xl shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-800 transition duration-200"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13.414 12l5.293-5.293a1 1 0 00-1.414-1.414L12 10.586 6.707 5.293a1 1 0 00-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 101.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex space-x-4">
            <img
              src="default-avatar.png"
              alt="User Avatar"
              className="w-12 h-12 rounded-full border border-gray-800"
            />

            <div className="flex-1 space-y-4">
              <textarea
                ref={textareaRef}
                value={tweet}
                name="description"
                onChange={(e) => setTweet(e.target.value)}
                placeholder="What's happening?"
                maxLength={MAX_CHARS}
                className="w-full bg-transparent text-xl text-white placeholder-gray-600 border-none focus:ring-0 resize-none min-h-[120px]"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-800">
                  <img
                    src={imagePreview}
                    alt="Tweet image"
                    className="max-h-80 w-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-full p-2 hover:bg-opacity-100 transition duration-200"
                  >
                    <svg
                      className="w-5 h-5 text-white"
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
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-[#1DA1F2]">
              {/* Image Upload */}
              <label className="cursor-pointer hover:bg-[#1DA1F2] hover:bg-opacity-10 p-2 rounded-full transition duration-200">
                <svg
                  className="w-5 h-5"
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
              <div
                className={`text-sm ${
                  charCount > MAX_CHARS * 0.8
                    ? charCount > MAX_CHARS * 0.9
                      ? "text-red-500"
                      : "text-yellow-500"
                    : "text-gray-500"
                }`}
              >
                {MAX_CHARS - charCount}
              </div>

              {/* Tweet Button */}
              <button
                onClick={handleSubmit}
                disabled={!tweet.trim() && !selectedImage}
                className={`px-4 py-1.5 rounded-full font-bold text-sm ${
                  tweet.trim() || selectedImage
                    ? "bg-[#1DA1F2] text-white hover:bg-[#1a91da]"
                    : "bg-[#1DA1F2] bg-opacity-50 text-white cursor-not-allowed"
                } transition duration-200`}
              >
                Tweet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetPopup;

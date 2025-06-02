import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MessageIcon,
  NotificationIcon,
} from "../components/Icons/Icons.jsx";
import TweetPopup from "./PopUp/TweetPopup.js";
import { useSelector } from "react-redux";

const Navbar = () => {
  const reduxUser = useSelector((state) => state.user);
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTweetPopupOpen, setIsTweetPopupOpen] = useState(false);
  const [userImage, setUserImage] = useState("default-avatar.png");

  useEffect(() => {
    if (reduxUser && reduxUser.avatar) {
      setUserImage(reduxUser.avatar);
    }
  }, [reduxUser]);

  // Handle logout
  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <>
      <nav className="bg-black border-b border-gray-800 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <img
                  src="/assets/logo-white.png"
                  alt="Twitter Logo"
                  className=" h-6 w-6"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/" current={location.pathname === "/"}>
                <HomeIcon />
                <span>Home</span>
              </NavLink>
              {/* 
              <NavLink to="/explore" current={location.pathname === "/explore"}>
                <ExploreIcon />
                <span>Explore</span>
              </NavLink> */}

              <NavLink
                to="/notifications"
                current={location.pathname === "/notifications"}
              >
                <NotificationIcon />
                <span>Notifications</span>
              </NavLink>

              <NavLink
                to="/messages"
                current={location.pathname === "/messages"}
              >
                <MessageIcon />
                <span>Messages</span>
              </NavLink>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsTweetPopupOpen(true)}
                className="bg-[#1DA1F2] text-white rounded-full px-4 py-2 font-bold hover:bg-[#1a91da] transition duration-200"
              >
                Tweet
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={userImage} // Dynamically set user avatar here
                    alt="Profile"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-xl shadow-lg py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-white hover:bg-gray-900"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-white hover:bg-gray-900"
                    >
                      Settings
                    </Link>
                    <hr className="border-gray-800" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-900"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <TweetPopup
        isOpen={isTweetPopupOpen}
        onClose={() => setIsTweetPopupOpen(false)}
      />
    </>
  );
};

const NavLink = ({ to, children, current }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 text-lg hover:text-[#1DA1F2] transition duration-200 ${
      current ? "text-white font-bold" : "text-gray-500"
    }`}
  >
    {children}
  </Link>
);

export default Navbar;

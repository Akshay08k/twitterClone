import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MessageIcon,
  ExploreIcon,
  NotificationIcon,
} from "../components/Icons/Icons.jsx";
import TweetPopup from "./popups/TweetPopup";
import axios from "axios";
const Navbar = () => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTweetPopupOpen, setIsTweetPopupOpen] = useState(false);

  //HANDLE LOGOUT IS DONE
  const handleLogout = () => {
    axios
      .post("http://localhost:3000/user/logout", {}, { withCredentials: true })
      .then((res) => console.log(res.data))
      .then(() => (window.location.href = "/"))
      .catch((err) => console.log(err));
  };

  return (
    <>
      <nav className="bg-black border-b border-gray-800 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/home" className="flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-[#1DA1F2]"
                  fill="currentColor"
                >
                  <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                </svg>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/home" current={location.pathname === "/home"}>
                <HomeIcon />
                <span>Home</span>
              </NavLink>

              <NavLink to="/explore" current={location.pathname === "/explore"}>
                <ExploreIcon />
                <span>Explore</span>
              </NavLink>

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
                    src="default-avatar.png"
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

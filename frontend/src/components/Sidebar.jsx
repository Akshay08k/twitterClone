import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Home,
  Hash,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  Feather,
  MoreHorizontal,
  LogOut,
  Sparkles,
} from "lucide-react";
import TweetPopup from "./PopUp/TweetPopup.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const Sidebar = () => {
  const reduxUser = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isTweetPopupOpen, setIsTweetPopupOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Hash },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Messages", path: "/messages", icon: Mail },
    { name: "Bookmarks", path: "/bookmarks", icon: Bookmark },
    { name: "Premium", path: "/premium", icon: Sparkles },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      window.location.href = "/login";
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <header className="hidden sm:flex flex-col justify-between items-end xl:items-start w-20 xl:w-64 h-screen sticky top-0 px-2 xl:px-4 py-3 border-r border-[#24272c] select-none z-30">
        <div className="w-full flex flex-col items-center xl:items-start space-y-1">
          {/* Logo */}
          <Link
            to="/"
            className="p-3 rounded-full hover:bg-white/10 transition-colors inline-flex items-center justify-center text-white mb-1 group"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 fill-current text-white group-hover:scale-105 transition-transform">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>

          {/* Navigation Items */}
          <nav className="w-full space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-4 p-3 rounded-full transition-all duration-200 group w-full ${
                    active
                      ? "font-extrabold text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white font-medium"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-7 h-7 ${active ? "stroke-[2.5px] text-[#1d9bf0]" : ""}`} />
                  </div>
                  <span className="hidden xl:inline text-xl tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Post / Tweet Button */}
          <div className="w-full pt-4">
            <button
              onClick={() => setIsTweetPopupOpen(true)}
              className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold p-3 xl:py-3.5 xl:px-8 rounded-full shadow-glow transition-all duration-200 flex items-center justify-center space-x-2 group active:scale-95"
            >
              <Feather className="w-6 h-6 xl:hidden group-hover:rotate-12 transition-transform" />
              <span className="hidden xl:inline text-base font-bold">Post</span>
            </button>
          </div>
        </div>

        {/* User Card at bottom */}
        {reduxUser?._id && (
          <div className="w-full relative mb-1">
            {isUserMenuOpen && (
              <div className="absolute bottom-full mb-3 left-0 w-64 bg-black border border-[#24272c] rounded-2xl shadow-card py-2 z-50 animate-fadeIn">
                <Link
                  to={`/profile/${reduxUser.username}`}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-[#16181c] text-white transition-colors text-sm"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>View profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-[#16181c] text-white transition-colors text-sm"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Settings & Privacy</span>
                </Link>
                <div className="border-t border-[#24272c] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition-colors text-sm text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out @{reduxUser.username}</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-full hover:bg-white/10 transition-colors text-left"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={reduxUser.avatar || "/default-avatar.png"}
                  alt={reduxUser.username}
                  className="w-10 h-10 rounded-full object-cover border border-[#24272c]"
                />
                <div className="hidden xl:block min-w-0 leading-tight">
                  <p className="font-bold text-white text-sm truncate">{reduxUser.username}</p>
                  <p className="text-gray-500 text-xs truncate">@{reduxUser.userHandle || reduxUser.username}</p>
                </div>
              </div>
              <MoreHorizontal className="hidden xl:block w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-[#24272c] px-4 py-2 flex justify-around items-center z-40">
        <Link to="/" className={`p-2 ${isActive("/") ? "text-[#1d9bf0]" : "text-gray-400"}`}>
          <Home className="w-6 h-6" />
        </Link>
        <Link to="/explore" className={`p-2 ${isActive("/explore") ? "text-[#1d9bf0]" : "text-gray-400"}`}>
          <Hash className="w-6 h-6" />
        </Link>
        <Link to="/notifications" className={`p-2 ${isActive("/notifications") ? "text-[#1d9bf0]" : "text-gray-400"}`}>
          <Bell className="w-6 h-6" />
        </Link>
        <Link to="/messages" className={`p-2 ${isActive("/messages") ? "text-[#1d9bf0]" : "text-gray-400"}`}>
          <Mail className="w-6 h-6" />
        </Link>
        <Link to="/profile" className={`p-2 ${isActive("/profile") ? "text-[#1d9bf0]" : "text-gray-400"}`}>
          <User className="w-6 h-6" />
        </Link>
      </div>

      {/* Mobile Compose FAB */}
      <button
        onClick={() => setIsTweetPopupOpen(true)}
        className="sm:hidden fixed bottom-16 right-4 bg-[#1d9bf0] text-white p-3.5 rounded-full shadow-glow z-40 active:scale-90 transition-transform"
      >
        <Feather className="w-6 h-6" />
      </button>

      {/* Global Compose Tweet Popup */}
      <TweetPopup
        isOpen={isTweetPopupOpen}
        onClose={() => setIsTweetPopupOpen(false)}
      />
    </>
  );
};

export default Sidebar;

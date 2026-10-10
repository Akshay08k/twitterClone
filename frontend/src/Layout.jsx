import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import RightSidebar from "./components/RightSidebar.jsx";
import { Toaster } from "react-hot-toast";

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#1d9bf0] border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm font-medium tracking-wide">Loading Twitty...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Messages and Settings pages look best with customized right space
  const hideRightSidebar =
    location.pathname.startsWith("/messages") ||
    location.pathname.startsWith("/settings");

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea]">
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#16181c",
            color: "#ffffff",
            border: "1px solid #24272c",
            fontSize: "14px",
            borderRadius: "9999px",
            padding: "10px 18px",
          },
        }}
      />

      <div className="max-w-7xl mx-auto flex justify-center min-h-screen">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Main Content */}
        <main
          className={`flex-1 min-h-screen ${
            location.pathname.startsWith("/messages")
              ? "max-w-5xl h-screen overflow-hidden border-r border-[#24272c]"
              : hideRightSidebar
              ? "max-w-4xl pb-16 sm:pb-0"
              : "max-w-[600px] border-r border-[#24272c] pb-16 sm:pb-0"
          }`}
        >
          <Outlet />
        </main>

        {/* Right Widgets Sidebar */}
        {!hideRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
}

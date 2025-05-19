import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";

import Home from "./components/Home.jsx";
import ProfileUpdate from "./components/Auth/Profile.jsx";
import Logout from "./components/Auth/Logout.jsx";
import TrendingSection from "./components/Trending/Trending.jsx";
import SinglePost from "./components/SinglePost.jsx";
import Navbar from "./components/Navbar.jsx";
import PrivateRoutes from "./components/Auth/PrivateRoutes.jsx";

export default function Layout() {
  const { user, loading } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex bg-darkBg text-darkText h-screen">
      <Navbar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/dashboard" element={<PrivateRoutes element={<Home />} />} />
          <Route
            path="/treading"
            element={<PrivateRoutes element={<TrendingSection />} />}
          />

          <Route
            path="/updates"
            element={<PrivateRoutes element={<ProfileUpdate />} />}
          />

          <Route
            path="/posts/:id"
            element={<PrivateRoutes element={<SinglePost />} />}
          />

          <Route
            path="/logout"
            element={<PrivateRoutes element={<Logout />} />}
          />

          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </div>
  );
}

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Root from "./components/Root.jsx";
import Login from "./components/Auth/Login.jsx";
import Home from "./components/Home.jsx";
import ProfileUpdate from "./components/Auth/Profile.jsx";
import Register from "./components/Auth/Register.jsx";
import TrendingSection from "./components/Trending/Trending.jsx";
import SinglePost from "./components/SinglePost.jsx";
import { useEffect } from "react";

// Higher Order Component for Protected Routes
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default function RouterComponent() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated);
  }, [isAuthenticated]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          index: true,
          element: isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Login />
          ),
        },
        {
          path: "login",
          element: isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Login />
          ),
        },
        {
          path: "register",
          element: isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Register />
          ),
        },
        {
          path: "home",
          element: <ProtectedRoute element={<Home />} />,
        },
        {
          path: "explore",
          element: <ProtectedRoute element={<TrendingSection />} />,
        },
        {
          path: "profile",
          element: <ProtectedRoute element={<ProfileUpdate />} />,
        },
        {
          path: "posts/:postId",
          element: <ProtectedRoute element={<SinglePost />} />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

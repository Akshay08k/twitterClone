import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext"; // Import the useAuth hook
import Root from "./components/Root.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import App from "./App.jsx";
import ProfileUpdate from "./components/Profile.jsx";
import TrendingSection from "./components/Trending/Treding.jsx"; // Fixed spelling
import SinglePost from "./components/SinglePost.jsx";

export default function RouterComponent() {
  const { isAuthenticated } = useAuth();

  console.log("User Authenticated:", isAuthenticated);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          index: true, // Default route
          element: isAuthenticated ? <App /> : <Login />,
        },
        {
          path: "login",
          element: !isAuthenticated ? <Login /> : <App />,
        },
        {
          path: "register",
          element: !isAuthenticated ? <Register /> : <App />, // Redirect logged-in users
        },
        {
          path: "home",
          element: <App />,
        },
        {
          path: "explore",
          element: <TrendingSection />,
        },
        {
          path: "profile",
          element: <ProfileUpdate />,
        },
        {
          path: "posts/:postId",
          element: <SinglePost />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

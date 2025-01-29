import { createRoot } from "react-dom/client";
import "./index.css";
import Root from "./components/Root.jsx";
import Login from "../src/components/Login.jsx";
import Register from "../src/components/Register.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import App from "./App.jsx";
import ProfileUpdate from "./components/Profile.jsx";
import TrendingSection from "./components/Trending/Treding.jsx";
import SinglePost from "./components/SinglePost.jsx";

const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorBoundary />}>
      <Route path="/login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/home" element={<App />} />
      <Route path="/explore" element={<TrendingSection />} />
      <Route path="/notifications" element={<App />} />
      <Route path="/messages" element={<App />} />
      <Route path="/posts/:postId" element={<SinglePost />} />
      <Route path="/profile" element={<ProfileUpdate />} />
    </Route>
  )
);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={Router} />
);

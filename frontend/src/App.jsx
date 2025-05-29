import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
//context imports
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from "react-redux";
import store from "./contexts/store";

//component imports
import Layout from "./Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Home from "./components/Home";
import ProfileUpdate from "./components/Auth/Profile";
import Logout from "./components/Auth/Logout";
import ExploreTab from "./components/Trending/ExploreTab";
import SinglePost from "./components/SinglePost";
import Profile from "./components/Auth/Profile";
import ProfileVisiting from "./components/ProfileVisiting";
import ErrorBoundary from "./components/ErrorBoundary";
import Settings from "./components/Settings/SettingsPage";
import NotificationPage from "./components/Notification/Notification";
const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="explore" element={<ExploreTab />} />
              <Route path="updates" element={<ProfileUpdate />} />
              <Route path="posts/:id" element={<SinglePost />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="logout" element={<Logout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/profile/:username" element={<ProfileVisiting />} />
              <Route path="*" element={<ErrorBoundary />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App;

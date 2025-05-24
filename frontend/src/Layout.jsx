import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex bg-darkBg text-darkText h-screen">
      <Navbar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

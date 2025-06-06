import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import axios from "../../contexts/axios.js";
export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await axios.post("user/logout");

        logout();

        navigate("/login");
      } catch (error) {
        console.error("Logout failed", error);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white bg-black">
      <p>Logging out...</p>
    </div>
  );
}

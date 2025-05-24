// src/components/Logout.jsx
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // destory the tokens in local storage
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}

import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx"; // Ensure Navbar is correctly imported

export default function Root() {
  const location = useLocation();
  console.log("Current Route:", location.pathname); // Logs current path

  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

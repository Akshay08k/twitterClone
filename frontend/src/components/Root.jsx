import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx"; // Assuming you have a Navbar component

export default function Root() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet /> {/* This renders the child routes */}
      </main>
    </div>
  );
}

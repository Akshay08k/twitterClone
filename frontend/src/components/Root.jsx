import { Outlet } from "react-router-dom";
// Ensure Navbar is correctly imported

export default function Root() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

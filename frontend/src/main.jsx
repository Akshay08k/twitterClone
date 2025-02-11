// src/index.js or src/main.jsx
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";
import RouterComponent from "./RouterComponents.jsx"; // Your routing component

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterComponent />
  </AuthProvider>
);

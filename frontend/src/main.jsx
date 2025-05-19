// src/index.js or src/main.jsx
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";
import RouterComponent from "./Layout.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);

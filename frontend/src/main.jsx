import { createRoot } from "react-dom/client";
import "./index.css";
import { StrictMode } from "react";
import App from "./App.jsx";
const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(
  navigator.userAgent
);

const rootElement = document.getElementById("root");

if (isMobileDevice) {
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; padding: 1rem; font-family: sans-serif; color: white;">
      <div>
        <h2>This app isn't available on mobile right now.</h2>
        <p>Please switch to a desktop device to continue.</p>
      </div>
    </div>
  `;
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

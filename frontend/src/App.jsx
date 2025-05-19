import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Layout from "./Layout";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

const App = () => {
  console.log("Current URL:", window.location.href);
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<Layout />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;

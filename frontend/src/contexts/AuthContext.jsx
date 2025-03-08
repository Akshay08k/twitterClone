import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Fetch token from localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/user/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        const jwtToken = res.data.token; // Assume backend sends { token: "JWT_TOKEN" }

        // Store the token securely
        localStorage.setItem("token", jwtToken);

        setToken(jwtToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication
export function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;

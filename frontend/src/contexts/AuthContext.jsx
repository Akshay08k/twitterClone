import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:3000/user/validateToken",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res.data.valid) {
          setIsAuthenticated(true);
        } else {
          logout(); // Only logout if backend confirms token is invalid
        }
      } catch (error) {
        console.error("Token validation error:", error);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/user/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        const jwtToken = res.data.data.accessToken;

        localStorage.setItem("token", jwtToken);
        setToken(jwtToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;

// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// Create authentication context
const AuthContext = createContext();

// AuthProvider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching authentication status from storage (or backend)
    const storedAuthStatus = localStorage.getItem("isAuthenticated");
    if (storedAuthStatus === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication
export function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;

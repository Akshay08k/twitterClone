// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for authentication state
const AuthContext = createContext();

// AuthProvider component to provide authentication state to the app
export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Simulate fetching user authentication status from localStorage (or your backend)
    useEffect(() => {
        const storedAuthStatus = localStorage.getItem("isAuthenticated");
        setIsAuthenticated(storedAuthStatus === "true"); // You can use more advanced checks here
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
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use authentication state
export function useAuth() {
    return useContext(AuthContext);
}

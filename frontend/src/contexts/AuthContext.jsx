import { createContext, useState, useEffect, useContext } from "react";
import axios from "./axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/user/me");
      if (res.status === 200) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refresh = await axios.post("/user/refresh-token");
          if (refresh.status === 200) {
            const retry = await axios.get("/user/me");
            setUser(retry.data);
          } else {
            setUser(null);
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          setUser(null);
        }
      } else {
        console.error("Error during user fetch:", error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await axios.post("/user/logout");
    setUser(null);
  };

  // useEffect(() => {
  //   fetchUser(); // Check if the user is authenticated based on the token
  // }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useEffect, useContext } from "react";
import axios from "../contexts/axios";
import { useDispatch } from "react-redux";
import { setUser as setReduxUser } from "./userSlice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const syncUser = (userData) => {
    setUser(userData); // local context state
    dispatch(setReduxUser(userData)); // redux state
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/user/me");
      if (res.status === 200) {
        syncUser(res.data);
      } else {
        setUser(null);
        dispatch(setReduxUser({})); // clear redux state
      }
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refresh = await axios.post("/user/refresh-token");
          if (refresh.status === 200) {
            const retry = await axios.get("/user/me");
            syncUser(retry.data);
          } else {
            setUser(null);
            dispatch(setReduxUser({}));
          }
        } catch {
          setUser(null);
          dispatch(setReduxUser({}));
        }
      } else {
        setUser(null);
        dispatch(setReduxUser({}));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await axios.post("/user/logout");
    setUser(null);
    //Dont have to it manually in file
    //as we have combined the redux and authContext
    dispatch(setReduxUser({})); // clearing redux store on logout
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser: syncUser, loading, fetchUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

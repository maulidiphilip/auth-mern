import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

// Create the context
export const AppContext = createContext();

// AppContextProvider Component
export const AppContextProvider = ({ children }) => {
  axios.defaults.withCredentials = true;
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Function to get user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/user/data`, {
        withCredentials: true,
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  // Function to check auth status
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/auth/is-auth`, {
        withCredentials: true,
      });
      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  // Automatically check auth state on mount
  useEffect(() => {
    getAuthState();
  }, []);

  // Context value
  const value = {
    backendURL,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

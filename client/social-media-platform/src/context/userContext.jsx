// src/context/UserContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import {jwtDecode} from "jwt-decode"; // make sure you installed jwt-decode

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load user from token when provider mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = jwtDecode(token);
        setCurrentUser(user);
      } catch (err) {
        console.error("Invalid token", err);
        setCurrentUser(null);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

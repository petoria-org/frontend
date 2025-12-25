import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access");

    if (access && isTokenValid(access)) {
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setIsLoggedIn(false);
    }

    setLoading(false);
  }, []);

  const login = ({ access, refresh }) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setIsLoggedIn(true);
  };

  const logout = (redirect = true) => {
    console.log("LOGOUT CALLED");

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);

    if (redirect) {
        navigate("/login");
    }
  };


  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

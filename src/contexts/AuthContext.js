import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const user = sessionStorage.getItem("userData");
  const token = sessionStorage.getItem("8ee22acb-94b0-481d-b11b-f87168b880e3");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      localStorage.clear();
      window.location.href = process.env.REACT_APP_LOGINGATEWAY;
      // await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value = {
    user,
    token,
    logout,
    refreshUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

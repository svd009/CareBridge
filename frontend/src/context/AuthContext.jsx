import { createContext, useContext, useMemo, useState } from "react";
import {
  clearAccessToken,
  setAccessToken,
} from "../api/client";

const AuthContext = createContext(null);

function getStoredUser() {
  const storedUser = sessionStorage.getItem("carebridge_user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    sessionStorage.removeItem("carebridge_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  function login({ accessToken, user: authenticatedUser }) {
    setAccessToken(accessToken);
    sessionStorage.setItem(
      "carebridge_user",
      JSON.stringify(authenticatedUser)
    );
    setUser(authenticatedUser);
  }

  function logout() {
    clearAccessToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      logout,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
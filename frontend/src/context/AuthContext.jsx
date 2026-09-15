import { createContext, useContext, useState } from "react";
import api, {
  clearAccessToken,
  setAccessToken,
} from "../api/client.js";

const AuthContext = createContext(null);

function getSavedUser() {
  try {
    const savedUser = sessionStorage.getItem("carebridge_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);
  const [isLoading, setIsLoading] = useState(false);

  async function login({ email, password }) {
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, user: authenticatedUser } = response.data;

      setAccessToken(accessToken);
      sessionStorage.setItem(
        "carebridge_user",
        JSON.stringify(authenticatedUser)
      );
      setUser(authenticatedUser);

      return { success: true };
    } catch (error) {
      clearAccessToken();
      setUser(null);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to sign in. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearAccessToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
      }}
    >
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
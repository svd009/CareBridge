import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("medsecure_user");
    return stored ? JSON.parse(stored) : null;
  });

  function login(accessToken, nextUser) {
    localStorage.setItem("medsecure_token", accessToken);
    localStorage.setItem("medsecure_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("medsecure_token");
    localStorage.removeItem("medsecure_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
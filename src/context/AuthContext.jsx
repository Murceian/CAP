import { createContext, useContext, useState } from "react";
import apiClient from "../utils/apiClient";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function loadFromStorage() {
  const token = localStorage.getItem("cap_token");
  if (!token) return { token: null, user: null };
  const decoded = decodeToken(token);
  if (!decoded || decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem("cap_token");
    return { token: null, user: null };
  }
  return { token, user: decoded };
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuth] = useState(loadFromStorage);

  async function login(email, password) {
    const res = await apiClient.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("cap_token", newToken);
    setAuth({ token: newToken, user: newUser });
    return newUser;
  }

  async function register(email, password) {
    const res = await apiClient.post("/auth/register", { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("cap_token", newToken);
    setAuth({ token: newToken, user: newUser });
    return newUser;
  }

  function logout() {
    localStorage.removeItem("cap_token");
    setAuth({ token: null, user: null });
  }

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

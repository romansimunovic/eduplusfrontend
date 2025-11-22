// src/AuthContext.js
import { createContext, useState, useEffect, useCallback } from "react";
export const AuthContext = createContext();

const TOKEN_KEY = "jwt_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {email, role}
  const [token, _setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");

  // sigurni parser tokena
  const parseToken = useCallback((t) => {
    if (!t) return null;
    try {
      const parts = t.split(".");
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      // opcionalno: provjeri expiry (exp je u sekundama)
      if (payload.exp && Date.now() > payload.exp * 1000) return null;
      return { payload, user: { email: payload.email, role: payload.role } };
    } catch (e) {
      console.warn("Invalid JWT:", e);
      return null;
    }
  }, []);

  // centralizirano postavljanje tokena (poziva se iz login komponenti)
  const setToken = useCallback((newToken) => {
    if (!newToken) {
      _setToken("");
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    const parsed = parseToken(newToken);
    if (!parsed) {
      // token invalid/istekao -> clear
      _setToken("");
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    _setToken(newToken);
    setUser(parsed.user);
    localStorage.setItem(TOKEN_KEY, newToken);
  }, [parseToken]);

  // inicijalizacija iz localStorage (run samo jednom)
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = parseToken(stored);
      if (parsed) {
        _setToken(stored);
        setUser(parsed.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        _setToken("");
        setUser(null);
      }
    }
  }, [parseToken]);

  const logout = useCallback(() => setToken(""), [setToken]);

  return (
    <AuthContext.Provider value={{ user, token, setToken, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

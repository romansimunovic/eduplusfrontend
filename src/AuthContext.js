import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {email, role}
  const [token, setToken] = useState(localStorage.getItem("jwt_token") || "");

  useEffect(() => {
    if (token) {
      // Decode JWT (na frontend možeš jwt-decode ili radi backend validate)
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ email: payload.email, role: payload.role });
      localStorage.setItem("jwt_token", token);
    } else {
      setUser(null);
      localStorage.removeItem("jwt_token");
    }
  }, [token]);
  
  return (
    <AuthContext.Provider value={{ user, token, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

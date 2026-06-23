import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

interface AuthContextType {
  token: string | null;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    if (token) {
      // In a real app, we might decode the JWT or call /api/auth/me
      // For now, we'll just assume valid if present
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    setToken(response.token);
    setUser({ username });
  };

  const register = async (username: string, password: string) => {
    const response = await api.register(username, password);
    setToken(response.token);
    setUser({ username });
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";
import type { AuthUser } from "../types/user";

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await api.login(username, password);
    setToken(response.token);
    setUser({ username });
  };

  const register = async (
    username: string,
    password: string,
  ): Promise<void> => {
    const response = await api.register(username, password);
    setToken(response.token);
    setUser({ username });
  };

  const logout = (): void => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

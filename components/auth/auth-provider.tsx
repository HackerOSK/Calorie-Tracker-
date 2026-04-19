"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiGetMe, apiLogin, apiSignup, apiLogout } from "@/lib/api-client";

interface User {
  userId: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  signup: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data, error } = await apiGetMe();
      if (data && !error) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (
    email: string,
    password: string
  ): Promise<string | null> => {
    const { data, error } = await apiLogin(email, password);
    if (error) return error;
    if (data?.user) {
      setUser({
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
      });
    }
    return null;
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<string | null> => {
    const { data, error } = await apiSignup(name, email, password);
    if (error) return error;
    if (data?.user) {
      setUser({
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
      });
    }
    return null;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

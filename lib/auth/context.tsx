"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { apiClient } from "@/lib/api/client";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      const response: any = await apiClient.get("/auth/me");
      setUser(response.data);
      return response.data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        if (pathname !== "/login") router.push("/login");
        return;
      }
      try {
        await fetchUser();
        if (pathname === "/login") router.push("/dashboard");
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    try {
      const response: any = await apiClient.get("/auth/me");
      setUser(response.data);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

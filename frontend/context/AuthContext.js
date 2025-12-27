"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

// Helper for presence colors
const COLORS = ["#f87171", "#fb923c", "#fbbf24", "#4ade80", "#2dd4bf", "#60a5fa", "#818cf8", "#a78bfa", "#f472b6"];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser({
        ...res.data.user,
        color: getRandomColor()
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser({
      ...res.data.user,
      color: getRandomColor()
    });
    router.push("/dashboard");
  };

  const register = async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
    router.push("/verify-email");
  };

  const googleLogin = async (idToken) => {
    const res = await api.post("/auth/google", { idToken });
    setUser({
      ...res.data.user,
      color: getRandomColor()
    });
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      router.replace("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        fetchUser,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

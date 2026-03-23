"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authAPI } from "@/lib/api";
import { useEffect } from "react";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, logout: storeLogout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { access_token, user } = response.data;
    setAuth(user, access_token);
    router.push("/dashboard");
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const response = await authAPI.register({ email, password, full_name: fullName });
    const { access_token, user } = response.data;
    setAuth(user, access_token);
    router.push("/dashboard");
  };

  const logout = () => {
    storeLogout();
    router.push("/login");
  };

  return { user, isAuthenticated, login, register, logout };
}

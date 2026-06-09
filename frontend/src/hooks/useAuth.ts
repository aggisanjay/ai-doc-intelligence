"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authAPI } from "@/lib/api";
import { useEffect, useCallback } from "react";
import { useClerk } from "@clerk/nextjs";

export function useAuth() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isAuthenticated, setAuth, logout: storeLogout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { access_token, user: userData } = response.data;
    setAuth(userData, access_token);
    router.push("/dashboard");
  }, [setAuth, router]);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    const response = await authAPI.register({ email, password, full_name: fullName });
    const { access_token, user: userData } = response.data;
    setAuth(userData, access_token);
    router.push("/dashboard");
  }, [setAuth, router]);

  const logout = useCallback(async () => {
    storeLogout();
    await signOut();
    router.push("/login");
  }, [storeLogout, signOut, router]);

  const clerkSync = useCallback(async (email: string, fullName?: string) => {
    const response = await authAPI.clerkSync({ email, full_name: fullName });
    const { access_token, user: userData } = response.data;
    setAuth(userData, access_token);
    router.push("/dashboard");
  }, [setAuth, router]);

  return { user, isAuthenticated, login, register, logout, clerkSync };
}

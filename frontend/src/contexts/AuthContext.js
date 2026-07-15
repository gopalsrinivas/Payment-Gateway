"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchProfile, loginUser, logoutUser, registerUser } from "../services/authService";
import { clearToken, getToken, setToken } from "../utils/storage";
import { getRoleName, normalizeUser } from "../utils/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const response = await fetchProfile();
    const normalized = normalizeUser(response.data.user);
    setUser(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch (_error) {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [refreshProfile]);

  const login = useCallback(async (payload) => {
    const response = await loginUser(payload);
    const { token, user: loggedInUser } = response.data;
    const normalized = normalizeUser(loggedInUser);
    setToken(token);
    setUser(normalized);
    toast.success("Signed in");
    router.push(getRoleName(normalized) === "Admin" ? "/admin/dashboard" : "/dashboard");
  }, [router]);

  const register = useCallback(async (payload) => {
    await registerUser(payload);
    toast.success("Account created");
    router.push("/login");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (_error) {
      // Stateless JWT logout still removes the local token.
    }
    clearToken();
    setUser(null);
    window.dispatchEvent(new Event("cart:clear"));
    router.push("/login");
  }, [router]);

  const hasRole = useCallback((role) => getRoleName(user) === role, [user]);
  const value = useMemo(
    () => ({
      user,
      token: getToken(),
      loading,
      isLoading: loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile,
      hasRole,
    }),
    [user, loading, login, register, logout, refreshProfile, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

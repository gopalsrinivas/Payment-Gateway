"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchProfile, loginUser, logoutUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token = window.localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchProfile();
        setUser(response.data.data.user);
      } catch (_error) {
        window.localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const login = useCallback(async (payload) => {
    const response = await loginUser(payload);
    const { token, user: loggedInUser } = response.data.data;
    window.localStorage.setItem("authToken", token);
    setUser(loggedInUser);
    toast.success("Signed in");
    router.push("/dashboard");
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
    window.localStorage.removeItem("authToken");
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "../ui/Spinner";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <Spinner label="Restoring your session" />;
  if (!isAuthenticated) return <Spinner label="Redirecting to login" />;
  return children;
};

export default ProtectedRoute;

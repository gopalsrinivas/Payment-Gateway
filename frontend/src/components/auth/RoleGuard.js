"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorState from "../ui/ErrorState";
import Spinner from "../ui/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleName } from "../../utils/auth";

const RoleGuard = ({ role, children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <Spinner label="Checking access" />;
  if (!isAuthenticated) return <Spinner label="Redirecting to login" />;
  if (getRoleName(user) !== role) {
    return <ErrorState title="Access restricted" message="Your account does not have permission to view this page." />;
  }
  return children;
};

export default RoleGuard;

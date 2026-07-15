"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { formatDate } from "../../utils/date";
import { getRoleName } from "../../utils/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const roleName = getRoleName(user);

  return (
    <ProtectedRoute>
      <section className="mx-auto max-w-2xl rounded-md border bg-white p-6">
        <h1 className="text-3xl font-bold text-ink">Profile</h1>
        <dl className="mt-6 grid gap-4 text-sm">
          <div><dt className="font-medium text-slate-500">Name</dt><dd className="mt-1 text-ink">{user?.name}</dd></div>
          <div><dt className="font-medium text-slate-500">Email</dt><dd className="mt-1 break-words text-ink">{user?.email}</dd></div>
          <div><dt className="font-medium text-slate-500">Role</dt><dd className="mt-1 text-ink">{roleName || "Not available"}</dd></div>
          <div><dt className="font-medium text-slate-500">Active</dt><dd className="mt-1 text-ink">{user?.isActive === false ? "No" : "Yes"}</dd></div>
          <div><dt className="font-medium text-slate-500">Created</dt><dd className="mt-1 text-ink">{formatDate(user?.createdAt || user?.created_at)}</dd></div>
        </dl>
      </section>
    </ProtectedRoute>
  );
}

"use client";

import RoleGuard from "../../../components/auth/RoleGuard";
import { useAuth } from "../../../contexts/AuthContext";
import { getRoleName } from "../../../utils/auth";
import { ROLES } from "../../../utils/constants";
import { formatDate } from "../../../utils/date";

export default function AdminProfilePage() {
  const { user } = useAuth();
  return (
    <RoleGuard role={ROLES.ADMIN}>
      <section className="mx-auto max-w-3xl rounded-md border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-slate-500">Admin Profile</p>
        <h1 className="mt-1 text-3xl font-bold text-ink">{user?.name}</h1>
        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
          <div><dt className="font-medium text-slate-500">Email</dt><dd className="mt-1 break-words text-ink">{user?.email}</dd></div>
          <div><dt className="font-medium text-slate-500">Role</dt><dd className="mt-1 text-ink">{getRoleName(user)}</dd></div>
          <div><dt className="font-medium text-slate-500">Active</dt><dd className="mt-1 text-ink">{user?.isActive === false ? "No" : "Yes"}</dd></div>
          <div><dt className="font-medium text-slate-500">Created</dt><dd className="mt-1 text-ink">{formatDate(user?.createdAt || user?.created_at)}</dd></div>
        </dl>
      </section>
    </RoleGuard>
  );
}

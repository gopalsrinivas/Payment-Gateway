"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import { useAuth } from "../../contexts/AuthContext";
import { formatDate } from "../../utils/date";
import { getRoleName } from "../../utils/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const roleName = getRoleName(user);

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <CustomerPageHeader title="My Profile" description="Your customer account information. Sensitive authentication details are never shown here." />
        <dl className="mx-auto grid max-w-2xl gap-4 rounded-md border border-slate-200 bg-white p-6 text-sm shadow-sm">
          <div><dt className="font-medium text-slate-500">Name</dt><dd className="mt-1 text-ink">{user?.name}</dd></div>
          <div><dt className="font-medium text-slate-500">Email</dt><dd className="mt-1 break-words text-ink">{user?.email}</dd></div>
          <div><dt className="font-medium text-slate-500">Role</dt><dd className="mt-1 text-ink">{roleName || "Not available"}</dd></div>
          <div><dt className="font-medium text-slate-500">Active</dt><dd className="mt-1 text-ink">{user?.isActive === false ? "No" : "Yes"}</dd></div>
          <div><dt className="font-medium text-slate-500">Member since</dt><dd className="mt-1 text-ink">{formatDate(user?.createdAt || user?.created_at)}</dd></div>
        </dl>
      </section>
    </ProtectedRoute>
  );
}

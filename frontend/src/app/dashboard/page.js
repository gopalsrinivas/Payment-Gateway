"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return <div className="text-sm text-slate-600">Loading...</div>;
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Protected</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Dashboard</h1>
        <p className="mt-2 text-slate-600">Authentication is working. Product, order, and payment features arrive in later parts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">User</p>
          <p className="mt-1 font-medium text-ink">{user.name}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Email</p>
          <p className="mt-1 break-words font-medium text-ink">{user.email}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Role</p>
          <p className="mt-1 font-medium text-ink">{user.role?.name || "Customer"}</p>
        </div>
      </div>
    </section>
  );
}


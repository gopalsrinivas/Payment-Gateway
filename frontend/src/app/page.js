"use client";

import Link from "next/link";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { getRoleName } from "../utils/auth";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="grid gap-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div>
        <p className="text-sm font-semibold uppercase text-brand">Razorpay Test Mode</p>
        <h1 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">Payment Gateway</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Browse products, manage a cart, create trusted application orders, and review payment history through the Part 3 backend APIs.
          Full Razorpay processing is intentionally reserved for the next phase.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button as={Link} href="/products">Browse products</Button>
          {isAuthenticated ? (
            <Button as={Link} href={getRoleName(user) === "Admin" ? "/admin/dashboard" : "/dashboard"} variant="secondary">
              Open dashboard
            </Button>
          ) : (
            <>
              <Button as={Link} href="/login" variant="secondary">Sign in</Button>
              <Button as={Link} href="/register" variant="ghost">Register</Button>
            </>
          )}
        </div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Part 4 frontend scope</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>Role-aware Customer and Admin navigation</li>
          <li>Product, cart, checkout preparation, orders, and payments UI</li>
          <li>Backend-trusted totals and protected API calls</li>
          <li>Payment success/failure page foundation without frontend verification claims</li>
        </ul>
      </div>
    </section>
  );
}

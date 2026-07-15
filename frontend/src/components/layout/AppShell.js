"use client";

import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-ink">
            Payment Gateway Demo
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden text-slate-600 sm:inline">{user.email}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                  aria-label="Logout"
                  title="Logout"
                >
                  <FiLogOut />
                </button>
              </>
            ) : (
              <>
                <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100" href="/login">
                  Login
                </Link>
                <Link className="rounded-md bg-brand px-3 py-2 text-white hover:bg-teal-800" href="/register">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
};

export default AppShell;


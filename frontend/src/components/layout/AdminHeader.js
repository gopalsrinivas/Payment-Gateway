"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const mobileLinks = [
  ["Dashboard", "/admin/dashboard"],
  ["Products", "/admin/products"],
  ["Orders", "/admin/orders"],
  ["Payments", "/admin/payments"],
  ["Payment Logs", "/admin/payment-logs"],
  ["Profile", "/admin/profile"],
];

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Panel</p>
          <h1 className="text-lg font-semibold text-ink">Administration Workspace</h1>
        </div>
        <div className="hidden text-right text-sm lg:block">
          <p className="font-medium text-ink">{user?.name}</p>
          <p className="text-slate-500">{user?.email}</p>
        </div>
        <button type="button" className="rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle admin navigation" aria-expanded={open}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 text-sm lg:hidden" aria-label="Mobile admin navigation">
          <div className="flex flex-col gap-1">
            {mobileLinks.map(([label, href]) => {
              const active = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={`rounded-md px-3 py-2 ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`} aria-current={active ? "page" : undefined}>
                  {label}
                </Link>
              );
            })}
            <button type="button" onClick={logout} className="rounded-md px-3 py-2 text-left text-slate-700 hover:bg-slate-100">
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default AdminHeader;

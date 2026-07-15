"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBarChart2, FiCreditCard, FiFileText, FiLogOut, FiPackage, FiShoppingBag, FiUser } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const links = [
  ["Dashboard", "/admin/dashboard", FiBarChart2],
  ["Product Management", "/admin/products", FiPackage],
  ["Order Management", "/admin/orders", FiShoppingBag],
  ["Payment Management", "/admin/payments", FiCreditCard],
  ["Payment Logs", "/admin/payment-logs", FiFileText],
  ["Admin Profile", "/admin/profile", FiUser],
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden min-h-screen border-r border-slate-800 bg-slate-950 text-slate-100 lg:flex lg:flex-col">
      <div className="border-b border-slate-800 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Admin Panel</p>
        <Link href="/admin/dashboard" className="mt-1 block text-xl font-semibold">
          Payment Gateway
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Admin navigation">
        {links.map(([label, href, Icon]) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300 ${active ? "bg-teal-500 text-slate-950" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`} aria-current={active ? "page" : undefined}>
              <Icon aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-300">
          <FiLogOut aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

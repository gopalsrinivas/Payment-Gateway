"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiLogOut, FiMenu, FiShoppingCart, FiX } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { ROLES } from "../../utils/constants";
import { getRoleName } from "../../utils/auth";

const CustomerNavbar = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const roleName = getRoleName(user);
  const isCustomer = roleName === ROLES.CUSTOMER;
  const isAdmin = roleName === ROLES.ADMIN;
  const close = () => setOpen(false);

  const linkClass = (href) =>
    `rounded-md px-3 py-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-brand ${
      pathname === href || (href !== "/" && pathname?.startsWith(href))
        ? "bg-emerald-50 text-brand"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const navLinks = (
    <>
      <Link className={linkClass("/")} href="/" onClick={close}>
        Home
      </Link>
      <Link className={linkClass("/dashboard")} href="/dashboard" onClick={close}>
        Dashboard
      </Link>
      <Link className={linkClass("/products")} href="/products" onClick={close}>
        Products
      </Link>
      {isCustomer && (
        <>
          <Link className={linkClass("/cart")} href="/cart" aria-label={`Cart with ${itemCount} items`} onClick={close}>
            <FiShoppingCart className="inline" /> <span className="ml-1">Cart</span>
            <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">{itemCount}</span>
          </Link>
          <Link className={linkClass("/orders")} href="/orders" onClick={close}>
            Orders
          </Link>
          <Link className={linkClass("/payments")} href="/payments" onClick={close}>
            Payments
          </Link>
          <Link className={linkClass("/profile")} href="/profile" onClick={close}>
            Profile
          </Link>
        </>
      )}
      {isAdmin && (
        <Link className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand" href="/admin/dashboard" onClick={close}>
          Admin Panel
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-ink">
          Payment Gateway
          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-brand">Customer Panel</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm lg:flex" aria-label="Customer navigation">
          {!isLoading && navLinks}
          {!isLoading && isAuthenticated ? (
            <>
              <span className="hidden max-w-48 truncate text-slate-600 xl:inline">{user.email}</span>
              <button type="button" onClick={logout} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand" aria-label="Logout" title="Logout">
                <FiLogOut />
              </button>
            </>
          ) : null}
          {!isLoading && !isAuthenticated ? (
            <>
              <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100" href="/login">
                Login
              </Link>
              <Link className="rounded-md bg-brand px-3 py-2 text-white hover:bg-teal-800" href="/register">
                Register
              </Link>
            </>
          ) : null}
        </nav>
        <button type="button" className="rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 text-sm lg:hidden" aria-label="Mobile customer navigation">
          <div className="flex flex-col gap-1">
            {navLinks}
            {isAuthenticated ? (
              <button type="button" onClick={logout} className="rounded-md px-3 py-2 text-left text-slate-700 hover:bg-slate-100">
                Logout
              </button>
            ) : (
              <>
                <Link className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100" href="/login" onClick={close}>
                  Login
                </Link>
                <Link className="rounded-md bg-brand px-3 py-2 text-white" href="/register" onClick={close}>
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default CustomerNavbar;

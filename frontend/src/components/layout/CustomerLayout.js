"use client";

import CustomerNavbar from "./CustomerNavbar";

const CustomerLayout = ({ children }) => (
  <div className="min-h-screen bg-surface">
    <CustomerNavbar />
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-900">
      Razorpay Test Mode only. No real payment is processed.
    </div>
    <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
      Payment Gateway frontend. Secrets stay on the backend.
    </footer>
  </div>
);

export default CustomerLayout;

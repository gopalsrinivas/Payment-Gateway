"use client";

import CustomerNavbar from "./CustomerNavbar";

const CustomerLayout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-white">
    <CustomerNavbar />
    <div className="border-b border-emerald-200 bg-emerald-100/80 px-4 py-2 text-center text-sm font-medium text-emerald-900">
      Razorpay Test Mode - No real money will be charged.
    </div>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
      Payment Gateway frontend. Secrets stay on the backend.
    </footer>
  </div>
);

export default CustomerLayout;

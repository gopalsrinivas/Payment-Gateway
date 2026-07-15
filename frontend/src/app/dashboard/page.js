"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerStatCard from "../../components/customer/CustomerStatCard";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";
import Spinner from "../../components/ui/Spinner";
import { getCustomerDashboard } from "../../services/dashboardService";
import { formatCurrency } from "../../utils/currency";
import { normalizeApiError } from "../../utils/errors";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getCustomerDashboard();
        setSummary(response.data);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <CustomerPageHeader
          title="Dashboard"
          description="Welcome back. Review your cart, orders, and Razorpay Test Mode payment activity."
          actions={
            <>
              <Button as={Link} href="/products">Browse Products</Button>
              <Button as={Link} href="/cart" variant="secondary">View Cart</Button>
            </>
          }
        />
        {loading ? <Spinner label="Loading dashboard" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {summary ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CustomerStatCard label="Active cart items" value={summary.activeCartItemCount} helper="Ready for checkout" />
              <CustomerStatCard label="Total orders" value={summary.totalOrders} helper="Your order history" />
              <CustomerStatCard label="Pending orders" value={summary.pendingOrders} helper="Awaiting progress" />
              <CustomerStatCard label="Completed orders" value={summary.completedOrders} helper="Finished orders" />
              <CustomerStatCard label="Successful payments" value={summary.successfulPayments} helper="Verified by backend" />
              <CustomerStatCard label="Failed payments" value={summary.failedPayments} helper="Retryable where eligible" />
              <CustomerStatCard label="Pending payments" value={summary.pendingPayments} helper="Test checkout attempts" />
              <CustomerStatCard label="Total paid" value={formatCurrency(summary.totalPaidAmount)} helper="Captured payments only" />
            </div>
            <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
              <Button as={Link} href="/products">Browse Products</Button>
              <Button as={Link} href="/cart" variant="secondary">View Cart</Button>
              <Button as={Link} href="/orders" variant="secondary">My Orders</Button>
              <Button as={Link} href="/payments" variant="secondary">My Payments</Button>
            </div>
          </>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

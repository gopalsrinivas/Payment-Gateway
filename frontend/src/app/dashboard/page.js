"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import SummaryCard from "../../components/dashboard/SummaryCard";
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
        <div>
          <h1 className="text-3xl font-bold text-ink">Customer dashboard</h1>
          <p className="mt-2 text-slate-600">Your cart, order, and payment overview.</p>
        </div>
        {loading ? <Spinner label="Loading dashboard" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {summary ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Cart items" value={summary.activeCartItemCount} />
            <SummaryCard label="Total orders" value={summary.totalOrders} />
            <SummaryCard label="Pending orders" value={summary.pendingOrders} />
            <SummaryCard label="Completed orders" value={summary.completedOrders} />
            <SummaryCard label="Successful payments" value={summary.successfulPayments} />
            <SummaryCard label="Failed payments" value={summary.failedPayments} />
            <SummaryCard label="Pending payments" value={summary.pendingPayments} />
            <SummaryCard label="Total paid" value={formatCurrency(summary.totalPaidAmount)} />
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

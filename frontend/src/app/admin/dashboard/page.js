"use client";

import { useEffect, useState } from "react";
import RoleGuard from "../../../components/auth/RoleGuard";
import SummaryCard from "../../../components/dashboard/SummaryCard";
import ErrorState from "../../../components/ui/ErrorState";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import { getAdminDashboard } from "../../../services/dashboardService";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { normalizeApiError } from "../../../utils/errors";
import { ROLES } from "../../../utils/constants";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAdminDashboard();
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
    <RoleGuard role={ROLES.ADMIN}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-ink">Admin dashboard</h1>
        {loading ? <Spinner label="Loading admin dashboard" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {summary ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Active products" value={summary.activeProducts} />
              <SummaryCard label="Customers" value={summary.totalCustomers} />
              <SummaryCard label="Total orders" value={summary.totalOrders} />
              <SummaryCard label="Pending orders" value={summary.pendingOrders} />
              <SummaryCard label="Completed orders" value={summary.completedOrders} />
              <SummaryCard label="Successful payments" value={summary.successfulPayments} />
              <SummaryCard label="Failed payments" value={summary.failedPayments} />
              <SummaryCard label="Collected" value={formatCurrency(summary.totalCollectedAmount)} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-md border bg-white p-5">
                <h2 className="font-semibold text-ink">Recent orders</h2>
                <div className="mt-3 space-y-3">
                  {(summary.recentOrders || []).map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-3 text-sm">
                      <span>{order.order_number}</span><StatusBadge status={order.status} /><span>{formatDate(order.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border bg-white p-5">
                <h2 className="font-semibold text-ink">Recent payments</h2>
                <div className="mt-3 space-y-3">
                  {(summary.recentPayments || []).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between gap-3 text-sm">
                      <span>#{payment.id}</span><StatusBadge status={payment.status} /><span>{formatCurrency(payment.amount, payment.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </RoleGuard>
  );
}

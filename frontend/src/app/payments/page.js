"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { listPaymentHistory } from "../../services/paymentService";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { normalizeApiError } from "../../utils/errors";

export default function PaymentsPage() {
  const [data, setData] = useState({ items: [], pagination: null });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await listPaymentHistory({ page, limit: 10 });
        setData(response.data);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <CustomerPageHeader title="My Payments" description="Review customer-safe Razorpay Test Mode payment records and backend verification status." />
        {loading ? <Spinner label="Loading payments" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {!loading && !error && data.items.length === 0 ? <EmptyState title="No payments yet" message="Complete checkout to see verified payment attempts here." /> : null}
        {!loading && !error && data.items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3">Order</th><th className="p-3">Provider</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Action</th></tr></thead>
              <tbody className="divide-y">
                {data.items.map((payment) => (
                  <tr key={payment.id}><td className="p-3">{payment.orderNumber || "N/A"}</td><td className="p-3">{payment.provider}</td><td className="p-3">{formatCurrency(payment.amount, payment.currency)}</td><td className="p-3"><StatusBadge status={payment.status} /></td><td className="p-3">{formatDate(payment.createdAt)}</td><td className="p-3"><Button as={Link} href={`/payments/${payment.id}`} variant="secondary">View Payment</Button></td></tr>
                ))}
              </tbody>
            </table>
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

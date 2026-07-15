"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "../../../components/auth/RoleGuard";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import Pagination from "../../../components/ui/Pagination";
import Select from "../../../components/ui/Select";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import { listPayments } from "../../../services/paymentService";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { normalizeApiError } from "../../../utils/errors";
import { PAYMENT_STATUSES, ROLES } from "../../../utils/constants";

export default function AdminPaymentsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "" });
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { ...filters };
        if (!params.status) delete params.status;
        const response = await listPayments(params);
        setData(response.data);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  return (
    <RoleGuard role={ROLES.ADMIN}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-ink">Admin payments</h1>
        <div className="rounded-md border bg-white p-4 md:w-64"><Select id="paymentStatus" label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}><option value="">All</option>{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</Select></div>
        {loading ? <Spinner label="Loading payments" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {!loading && !error && data.items.length === 0 ? <EmptyState title="No payments" message="Payment mutation actions are not part of Part 4." /> : null}
        {!loading && !error && data.items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="min-w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">ID</th><th className="p-3">Order</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y">{data.items.map((payment) => <tr key={payment.id}><td className="p-3">#{payment.id}</td><td className="p-3">{payment.order?.order_number || "N/A"}</td><td className="p-3">{formatCurrency(payment.amount, payment.currency)}</td><td className="p-3"><StatusBadge status={payment.status} /></td><td className="p-3">{formatDate(payment.created_at)}</td><td className="p-3"><Button as={Link} href={`/payments/${payment.id}`} variant="secondary">Details</Button></td></tr>)}</tbody></table>
            <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
          </div>
        ) : null}
      </section>
    </RoleGuard>
  );
}

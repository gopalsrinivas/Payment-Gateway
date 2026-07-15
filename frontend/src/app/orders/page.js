"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { listOrders } from "../../services/orderService";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { normalizeApiError } from "../../utils/errors";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "../../utils/constants";

export default function OrdersPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "", status: "", paymentStatus: "" });
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listOrders(filters);
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
    <ProtectedRoute>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-ink">Orders</h1>
        <div className="grid gap-3 rounded-md border bg-white p-4 md:grid-cols-4">
          <Input id="orderSearch" label="Search order" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })} />
          <Select id="status" label="Order status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}>
            <option value="">All</option>
            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Select id="paymentStatus" label="Payment status" value={filters.paymentStatus} onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value, page: 1 })}>
            <option value="">All</option>
            {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
        </div>
        {loading ? <Spinner label="Loading orders" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {!loading && !error && data.items.length === 0 ? <EmptyState title="No orders yet" message="Create an application order from checkout." /> : null}
        {!loading && !error && data.items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Payment</th><th className="p-3">Action</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((order) => (
                  <tr key={order.id}>
                    <td className="p-3 font-medium">{order.order_number}</td>
                    <td className="p-3">{formatDate(order.created_at)}</td>
                    <td className="p-3">{formatCurrency(order.total_amount, order.currency)}</td>
                    <td className="p-3"><StatusBadge status={order.status} /></td>
                    <td className="p-3"><StatusBadge status={order.payment_status} /></td>
                    <td className="p-3"><Button as={Link} href={`/orders/${order.id}`} variant="secondary">Details</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

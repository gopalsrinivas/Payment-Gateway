"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import RoleGuard from "../../../components/auth/RoleGuard";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import Modal from "../../../components/ui/Modal";
import Pagination from "../../../components/ui/Pagination";
import Select from "../../../components/ui/Select";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import { listOrders, updateOrderStatus } from "../../../services/orderService";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { getErrorMessage, normalizeApiError } from "../../../utils/errors";
import { ORDER_STATUSES, ROLES } from "../../../utils/constants";

const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["COMPLETED", "CANCELLED"],
};

export default function AdminOrdersPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "" });
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [change, setChange] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.status) delete params.status;
      const response = await listOrders(params);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const confirm = async () => {
    try {
      await updateOrderStatus(change.order.id, change.status);
      toast.success("Order status updated");
      setChange(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <RoleGuard role={ROLES.ADMIN}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-ink">Admin orders</h1>
        <div className="rounded-md border bg-white p-4 md:w-64">
          <Select id="adminStatus" label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}>
            <option value="">All</option>
            {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
        </div>
        {loading ? <Spinner label="Loading orders" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} onRetry={load} /> : null}
        {!loading && !error && data.items.length === 0 ? <EmptyState title="No orders" /> : null}
        {!loading && !error && data.items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Payment</th><th className="p-3">Actions</th></tr></thead>
              <tbody className="divide-y">
                {data.items.map((order) => (
                  <tr key={order.id}>
                    <td className="p-3">{order.order_number}</td><td className="p-3">{formatDate(order.created_at)}</td><td className="p-3">{formatCurrency(order.total_amount, order.currency)}</td><td className="p-3"><StatusBadge status={order.status} /></td><td className="p-3"><StatusBadge status={order.payment_status} /></td>
                    <td className="flex flex-wrap gap-2 p-3"><Button as={Link} href={`/admin/orders/${order.id}`} variant="secondary">Details</Button>{(transitions[order.status] || []).map((status) => <Button key={status} type="button" variant="secondary" onClick={() => setChange({ order, status })}>{status}</Button>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
          </div>
        ) : null}
        <Modal open={Boolean(change)} title="Update order status" onClose={() => setChange(null)}>
          <p className="text-sm text-slate-600">Change {change?.order?.order_number} to {change?.status}? Backend transition rules are final.</p>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setChange(null)}>Cancel</Button><Button type="button" onClick={confirm}>Confirm</Button></div>
        </Modal>
      </section>
    </RoleGuard>
  );
}

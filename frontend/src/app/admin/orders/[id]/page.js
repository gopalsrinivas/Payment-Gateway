"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import RoleGuard from "../../../../components/auth/RoleGuard";
import Button from "../../../../components/ui/Button";
import EmptyState from "../../../../components/ui/EmptyState";
import ErrorState from "../../../../components/ui/ErrorState";
import Spinner from "../../../../components/ui/Spinner";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { getOrder, updateOrderStatus } from "../../../../services/orderService";
import { formatCurrency } from "../../../../utils/currency";
import { formatDate } from "../../../../utils/date";
import { getErrorMessage, normalizeApiError } from "../../../../utils/errors";
import { ROLES } from "../../../../utils/constants";

const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["COMPLETED", "CANCELLED"],
};

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrder(id);
      setOrder(response.data.order);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      await updateOrderStatus(id, status);
      toast.success("Order status updated");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <RoleGuard role={ROLES.ADMIN}>
      {loading ? <Spinner label="Loading admin order" /> : null}
      {error ? (
        <div className="space-y-4">
          <ErrorState title="Order not available" message={error.message} requestId={error.requestId} />
          <Button as={Link} href="/admin/orders" variant="secondary">Back to Order Management</Button>
        </div>
      ) : null}
      {order ? (
        <section className="space-y-6">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">Admin Order Detail</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">{order.order_number}</h1>
            <p className="mt-2 text-slate-600">Created {formatDate(order.created_at)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.payment_status} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(transitions[order.status] || []).map((status) => (
                <Button key={status} type="button" variant="secondary" disabled={updating} onClick={() => changeStatus(status)}>
                  Mark {status}
                </Button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3">Product</th><th className="p-3">SKU</th><th className="p-3">Unit</th><th className="p-3">Qty</th><th className="p-3">Line total</th></tr></thead>
              <tbody className="divide-y">
                {(order.items || []).map((item) => (
                  <tr key={item.id}><td className="p-3">{item.product_name}</td><td className="p-3">{item.product_sku}</td><td className="p-3">{formatCurrency(item.unit_price, order.currency)}</td><td className="p-3">{item.quantity}</td><td className="p-3">{formatCurrency(item.line_total, order.currency)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border bg-white p-5"><p className="text-sm text-slate-500">Subtotal</p><p className="mt-1 text-xl font-semibold">{formatCurrency(order.subtotal_amount, order.currency)}</p></div>
            <div className="rounded-md border bg-white p-5"><p className="text-sm text-slate-500">Total</p><p className="mt-1 text-xl font-semibold">{formatCurrency(order.total_amount, order.currency)}</p></div>
            <div className="rounded-md border bg-white p-5"><p className="text-sm text-slate-500">Payments</p><p className="mt-1 text-xl font-semibold">{order.payments?.length || 0}</p></div>
          </div>
          {!order.payments?.length ? <EmptyState title="No payment records" message="Payment execution is reserved for Part 5." /> : null}
        </section>
      ) : null}
    </RoleGuard>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import { getOrder } from "../../../services/orderService";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { normalizeApiError } from "../../../utils/errors";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getOrder(id);
        setOrder(response.data.order);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <ProtectedRoute>
      {loading ? <Spinner label="Loading order" /> : null}
      {error ? (
        <div className="space-y-4">
          <ErrorState
            title="Order not available"
            message={error.statusCode === 404 ? "This order does not exist or is not available for your account." : error.message}
            requestId={error.requestId}
          />
          <div className="flex flex-wrap gap-3">
            <Button as={Link} href="/orders" variant="secondary">Back to My Orders</Button>
            <Button as={Link} href="/dashboard">Go to Dashboard</Button>
          </div>
        </div>
      ) : null}
      {order ? (
        <section className="space-y-6">
          <div className="rounded-md border bg-white p-5">
            <h1 className="text-3xl font-bold text-ink">{order.order_number}</h1>
            <p className="mt-2 text-slate-600">{formatDate(order.created_at)}</p>
            <div className="mt-4 flex flex-wrap gap-3"><StatusBadge status={order.status} /><StatusBadge status={order.payment_status} /></div>
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
          <div className="rounded-md border bg-white p-5">
            <p className="text-lg font-semibold text-ink">Total: {formatCurrency(order.total_amount, order.currency)}</p>
            {order.payments?.length ? <p className="mt-2 text-sm text-slate-600">{order.payments.length} payment record(s) available.</p> : <EmptyState title="No payment records" message="Payment execution is reserved for Part 5." />}
          </div>
        </section>
      ) : null}
    </ProtectedRoute>
  );
}

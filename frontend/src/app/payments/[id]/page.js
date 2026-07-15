"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import ErrorState from "../../../components/ui/ErrorState";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import { getPayment } from "../../../services/paymentService";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { normalizeApiError } from "../../../utils/errors";

export default function PaymentDetailsPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getPayment(id);
        setPayment(response.data.payment);
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
      {loading ? <Spinner label="Loading payment" /> : null}
      {error ? <ErrorState title="Payment unavailable" message={error.message} requestId={error.requestId} /> : null}
      {payment ? (
        <section className="rounded-md border bg-white p-6">
          <h1 className="text-3xl font-bold text-ink">Payment #{payment.id}</h1>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <p><span className="text-slate-500">Order:</span> {payment.order?.order_number || "N/A"}</p>
            <p><span className="text-slate-500">Amount:</span> {formatCurrency(payment.amount, payment.currency)}</p>
            <p><span className="text-slate-500">Provider:</span> {payment.provider || "RAZORPAY"}</p>
            <p><span className="text-slate-500">Method:</span> {payment.method || "Not available"}</p>
            <p><span className="text-slate-500">Created:</span> {formatDate(payment.created_at)}</p>
            <p><span className="text-slate-500">Paid:</span> {formatDate(payment.paid_at)}</p>
            <p><span className="text-slate-500">Status:</span> <StatusBadge status={payment.status} /></p>
          </div>
          <p className="mt-5 text-sm text-slate-500">Sensitive payment signatures and raw gateway payloads are not displayed.</p>
        </section>
      ) : null}
    </ProtectedRoute>
  );
}

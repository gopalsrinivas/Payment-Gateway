"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";
import Spinner from "../../components/ui/Spinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { getPayment } from "../../services/paymentService";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { normalizeApiError } from "../../utils/errors";

export default function PaymentSuccessPage() {
  const [paymentId, setPaymentId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("paymentId");
    setPaymentId(id);
    if (!id) {
      setError({ message: "Verified payment reference is required." });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!paymentId) return;
    const load = async () => {
      try {
        const response = await getPayment(paymentId);
        setPayment(response.data.payment);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [paymentId]);

  return (
    <section className="mx-auto max-w-2xl rounded-md border border-emerald-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-emerald-800">Payment verified</h1>
      <p className="mt-3 text-slate-600">Razorpay Test Mode - No real money was charged.</p>
      {loading ? <Spinner label="Confirming payment" /> : null}
      {error ? <ErrorState title="Verification unavailable" message={error.message} requestId={error.requestId} /> : null}
      {payment ? (
        <div className="mt-5 grid gap-3 text-sm text-slate-700">
          <p><span className="text-slate-500">Order:</span> {payment.order?.order_number || "N/A"}</p>
          <p><span className="text-slate-500">Payment:</span> #{payment.id}</p>
          <p><span className="text-slate-500">Razorpay payment:</span> {payment.razorpay_payment_id || "Not available"}</p>
          <p><span className="text-slate-500">Amount:</span> {formatCurrency(payment.amount, payment.currency)}</p>
          <p><span className="text-slate-500">Status:</span> <StatusBadge status={payment.status} /></p>
          <p><span className="text-slate-500">Date:</span> {formatDate(payment.paid_at || payment.created_at)}</p>
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} href="/orders">View orders</Button>
        <Button as={Link} href="/payments" variant="secondary">Payment history</Button>
      </div>
    </section>
  );
}

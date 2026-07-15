"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";

export default function PaymentFailedPage() {
  const [orderId, setOrderId] = useState(null);
  const [reason, setReason] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setOrderId(searchParams.get("orderId"));
    setReason(searchParams.get("reason"));
  }, []);

  return (
    <section className="mx-auto max-w-2xl rounded-md border border-red-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-red-800">Payment not completed</h1>
      <p className="mt-3 text-slate-600">Razorpay Test Mode - No real money was charged.</p>
      <p className="mt-3 text-slate-600">The order remains retryable unless backend verification or webhook processing confirms a final status.</p>
      {reason ? <p className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-800">{reason}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {orderId ? <Button as={Link} href={`/orders/${orderId}`}>View order</Button> : null}
        <Button as={Link} href="/checkout" variant={orderId ? "secondary" : "primary"}>Retry payment</Button>
        <Button as={Link} href="/orders">View orders</Button>
        <Button as={Link} href="/products" variant="secondary">Browse products</Button>
      </div>
    </section>
  );
}

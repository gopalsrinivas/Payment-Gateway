"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CartSummary from "../../components/cart/CartSummary";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { useCart } from "../../contexts/CartContext";
import { createOrder } from "../../services/orderService";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/currency";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartLoading, refreshCart, setCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const response = await createOrder({ notes: "Created from Part 4 checkout preparation" });
      await refreshCart();
      setCart({ items: [], itemCount: 0, subtotal: "0.00", currency: "INR" });
      toast.success("Application order created");
      router.push(`/orders/${response.data.order.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ink">Checkout preparation</h1>
          <p className="mt-2 text-slate-600">Part 4 creates an application order only. Razorpay Checkout opens in Part 5 after backend payment endpoints exist.</p>
        </div>
        {cartLoading ? <Spinner label="Loading checkout summary" /> : null}
        {!cartLoading && cart.items.length === 0 ? <EmptyState title="Cart is empty" message="Add items before creating an order." /> : null}
        {!cartLoading && cart.items.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-md border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-ink">Trusted backend cart</h2>
              <div className="mt-4 divide-y">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                    <span>{item.productName} x {item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.lineTotal, item.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Payment action is intentionally disabled until Part 5. This step creates only a pending application order.
              </div>
              <Button type="button" className="mt-5" disabled={submitting} onClick={submit}>
                {submitting ? "Creating order..." : "Create application order"}
              </Button>
            </div>
            <CartSummary cart={cart} checkout={false} />
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CartSummary from "../../components/cart/CartSummary";
import PaymentButton from "../../components/checkout/PaymentButton";
import PaymentSummary from "../../components/checkout/PaymentSummary";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useRazorpay } from "../../hooks/useRazorpay";
import { createOrder } from "../../services/orderService";
import { initializePayment, recordPaymentFailure, verifyPayment } from "../../services/paymentService";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/currency";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartLoading, refreshCart, setCart } = useCart();
  const { loadingScript, openCheckout } = useRazorpay();
  const [submitting, setSubmitting] = useState(false);
  const [applicationOrder, setApplicationOrder] = useState(null);
  const [paymentContext, setPaymentContext] = useState(null);

  const ensureApplicationOrder = async () => {
    if (applicationOrder) return applicationOrder;
    const response = await createOrder({ notes: "Created from Razorpay Test Mode checkout" });
    const order = response.data.order;
    setApplicationOrder(order);
    await refreshCart();
    setCart({ items: [], itemCount: 0, subtotal: "0.00", currency: "INR" });
    return order;
  };

  const reportFailure = async (context, failure = {}) => {
    if (!context?.paymentId || !context?.razorpayOrderId) return;
    try {
      await recordPaymentFailure({
        paymentId: context.paymentId,
        applicationOrderId: context.applicationOrderId,
        razorpayOrderId: context.razorpayOrderId,
        razorpayPaymentId: failure?.error?.metadata?.payment_id,
        errorCode: failure?.error?.code,
        errorDescription: failure?.error?.description,
        errorReason: failure?.error?.reason,
        errorSource: failure?.error?.source,
        errorStep: failure?.error?.step,
      });
    } catch (_error) {
      // Failure telemetry is best-effort; the independent webhook remains authoritative.
    }
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const order = await ensureApplicationOrder();
      const init = await initializePayment({ orderId: order.id });
      const checkoutData = init.data;
      setPaymentContext(checkoutData);

      await openCheckout({
        key: checkoutData.razorpayKeyId || checkoutData.keyId,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: checkoutData.name || checkoutData.companyName || "Payment Gateway",
        description: checkoutData.description,
        order_id: checkoutData.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        notes: {
          applicationOrderId: String(checkoutData.applicationOrderId),
          applicationOrderNumber: checkoutData.applicationOrderNumber,
        },
        theme: { color: "#0f766e" },
        handler: async (response) => {
          try {
            const verified = await verifyPayment({
              paymentId: checkoutData.paymentId,
              applicationOrderId: checkoutData.applicationOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment verified");
            router.push(`/payment-success?paymentId=${verified.data.paymentId}`);
          } catch (error) {
            toast.error(getErrorMessage(error));
            router.push(`/payment-failed?paymentId=${checkoutData.paymentId}&orderId=${checkoutData.applicationOrderId}`);
          }
        },
        onPaymentFailed: async (failure) => {
          await reportFailure(checkoutData, failure);
          router.push(`/payment-failed?paymentId=${checkoutData.paymentId}&orderId=${checkoutData.applicationOrderId}`);
        },
        modal: {
          ondismiss: () => {
            toast("Checkout closed. You can retry from this page.");
          },
        },
      });
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
          <h1 className="text-3xl font-bold text-ink">Checkout</h1>
          <p className="mt-2 text-slate-600">Razorpay Test Mode - No real money will be charged.</p>
        </div>
        {cartLoading ? <Spinner label="Loading checkout summary" /> : null}
        {!cartLoading && cart.items.length === 0 && !applicationOrder ? <EmptyState title="Cart is empty" message="Add items before starting checkout." /> : null}
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
                Razorpay Test Mode - No real money will be charged. The payable amount is calculated by the backend.
              </div>
              <div className="mt-5 max-w-xs">
                <PaymentButton loading={submitting || loadingScript} disabled={cart.items.length === 0} onClick={submit} />
              </div>
            </div>
            <CartSummary cart={cart} checkout={false} />
          </div>
        ) : null}
        {applicationOrder && cart.items.length === 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <PaymentSummary
              items={applicationOrder.items || []}
              total={applicationOrder.total_amount}
              currency={applicationOrder.currency}
              order={applicationOrder}
            />
            <div className="rounded-md border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-600">Order is ready for payment. Retry uses the same application order and reuses an active Razorpay order when available.</p>
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Razorpay Test Mode - No real money will be charged.
              </div>
              <PaymentButton loading={submitting || loadingScript} disabled={!applicationOrder} onClick={submit} />
              {paymentContext ? <p className="mt-3 text-xs text-slate-500">Payment attempt #{paymentContext.paymentId}</p> : null}
              <Button type="button" variant="secondary" className="mt-3 w-full" onClick={() => router.push(`/orders/${applicationOrder.id}`)}>
                View order
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

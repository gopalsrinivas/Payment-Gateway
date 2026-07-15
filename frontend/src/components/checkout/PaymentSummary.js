"use client";

import { formatCurrency } from "../../utils/currency";

const PaymentSummary = ({ items = [], total, currency = "INR", order }) => (
  <div className="rounded-md border border-slate-200 bg-white p-5">
    <h2 className="text-lg font-semibold text-ink">Payment summary</h2>
    {order ? <p className="mt-2 text-sm text-slate-600">Order {order.order_number || order.orderNumber || `#${order.id}`}</p> : null}
    <div className="mt-4 divide-y">
      {items.map((item) => (
        <div key={item.id || item.productId} className="flex justify-between gap-4 py-3 text-sm">
          <span>{item.productName || item.product_name} x {item.quantity}</span>
          <span className="font-medium">{formatCurrency(item.lineTotal || item.line_total, item.currency || currency)}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 flex justify-between text-base font-semibold">
      <span>Total</span>
      <span>{formatCurrency(total, currency)}</span>
    </div>
  </div>
);

export default PaymentSummary;

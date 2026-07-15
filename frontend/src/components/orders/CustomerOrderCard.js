"use client";

import Link from "next/link";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const CustomerOrderCard = ({ order }) => (
  <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Order Number</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">{order.order_number}</h2>
        <p className="mt-1 text-sm text-slate-600">{formatDate(order.created_at)}</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-xs font-semibold uppercase text-slate-500">Order Total</p>
        <p className="mt-1 text-xl font-bold text-brand">{formatCurrency(order.total_amount, order.currency)}</p>
      </div>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <div>
        <p className="text-xs font-medium text-slate-500">Order Status</p>
        <div className="mt-1"><StatusBadge status={order.status} /></div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">Payment Status</p>
        <div className="mt-1"><StatusBadge status={order.payment_status} /></div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">Items</p>
        <p className="mt-1 text-sm font-medium text-ink">{order.items?.length || 0}</p>
      </div>
    </div>
    <div className="mt-4">
      <Button as={Link} href={`/orders/${order.id}`} variant="secondary">View Order</Button>
    </div>
  </article>
);

export default CustomerOrderCard;

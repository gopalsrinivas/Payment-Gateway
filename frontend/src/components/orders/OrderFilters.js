"use client";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { ORDER_FILTER_STATUSES, PAYMENT_FILTER_STATUSES } from "../../utils/constants";

const labelize = (value) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const OrderFilters = ({ filters, onChange, onReset }) => (
  <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
    <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-end">
      <Input
        id="orderSearch"
        label="Search by order number"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value, page: 1 })}
        placeholder="ORD-2026..."
      />
      <Select id="status" label="Order Status" value={filters.status} onChange={(event) => onChange({ status: event.target.value, page: 1 })}>
        <option value="ALL">All Orders</option>
        {ORDER_FILTER_STATUSES.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
      </Select>
      <Select id="paymentStatus" label="Payment Status" value={filters.paymentStatus} onChange={(event) => onChange({ paymentStatus: event.target.value, page: 1 })}>
        <option value="ALL">All Payments</option>
        {PAYMENT_FILTER_STATUSES.map((status) => <option key={status} value={status}>{labelize(status)}</option>)}
      </Select>
      <Select id="sortBy" label="Sort By" value={filters.sortBy} onChange={(event) => onChange({ sortBy: event.target.value, page: 1 })}>
        <option value="created_at">Newest</option>
        <option value="order_number">Order Number</option>
        <option value="total_amount">Order Total</option>
      </Select>
      <Button type="button" variant="secondary" onClick={onReset}>Reset Filters</Button>
    </div>
  </div>
);

export default OrderFilters;

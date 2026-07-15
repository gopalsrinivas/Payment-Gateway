"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerOrderCard from "../../components/orders/CustomerOrderCard";
import OrderFilters from "../../components/orders/OrderFilters";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";
import { listOrders } from "../../services/orderService";
import { ORDER_FILTER_STATUSES, PAYMENT_FILTER_STATUSES } from "../../utils/constants";
import { normalizeApiError } from "../../utils/errors";
import { cleanQueryParams, valueOrAll } from "../../utils/query";

const defaultFilters = {
  page: 1,
  limit: 10,
  search: "",
  status: "ALL",
  paymentStatus: "ALL",
  sortBy: "created_at",
  sortOrder: "DESC",
};

const getInitialFilters = () => {
  if (typeof window === "undefined") return defaultFilters;
  const params = new URLSearchParams(window.location.search);
  return {
    ...defaultFilters,
    page: Number(params.get("page")) > 0 ? Number(params.get("page")) : 1,
    search: params.get("search") || "",
    status: valueOrAll(params.get("status"), ORDER_FILTER_STATUSES),
    paymentStatus: valueOrAll(params.get("paymentStatus"), PAYMENT_FILTER_STATUSES),
    sortBy: ["created_at", "order_number", "total_amount"].includes(params.get("sortBy")) ? params.get("sortBy") : defaultFilters.sortBy,
  };
};

const getFilterMessage = (error) => {
  const field = error?.errors?.[0]?.field;
  if (field === "status") return "Unable to load orders because the selected order status filter is invalid. Please reset the filters and try again.";
  if (field === "paymentStatus" || field === "payment_status") return "Unable to load orders because the selected payment status filter is invalid. Please reset the filters and try again.";
  return error?.message;
};

export default function OrdersPage() {
  const [filters, setFilters] = useState(getInitialFilters);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestParams = useMemo(() => cleanQueryParams(filters), [filters]);

  useEffect(() => {
    const query = new URLSearchParams(requestParams).toString();
    const nextUrl = query ? `/orders?${query}` : "/orders";
    window.history.replaceState(null, "", nextUrl);
  }, [requestParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listOrders(requestParams);
        setData(response.data);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestParams]);

  const updateFilters = (patch) => setFilters((current) => ({ ...current, ...patch }));
  const resetFilters = () => setFilters(defaultFilters);
  const retry = () => setFilters((current) => ({ ...current }));

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <CustomerPageHeader
          title="My Orders"
          description="Track your orders, payment status, and test-mode checkout progress from one place."
          actions={<Button as={Link} href="/products">Browse Products</Button>}
        />

        <OrderFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />

        {loading ? <Spinner label="Loading your orders" /> : null}
        {error ? (
          <ErrorState
            title="Unable to load orders"
            message={getFilterMessage(error)}
            requestId={error.requestId}
            onRetry={retry}
          />
        ) : null}
        {error ? (
          <div>
            <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
          </div>
        ) : null}
        {!loading && !error && data.items.length === 0 ? (
          <EmptyState
            title="No orders found"
            message="Create an order from checkout, or reset filters to see all of your orders."
            action={<Button as={Link} href="/products">Continue Shopping</Button>}
          />
        ) : null}
        {!loading && !error && data.items.length > 0 ? (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.items.map((order) => <CustomerOrderCard key={order.id} order={order} />)}
            </div>
            <Pagination pagination={data.pagination} onPageChange={(page) => updateFilters({ page })} />
          </>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState } from "react";
import RoleGuard from "../../../components/auth/RoleGuard";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Pagination from "../../../components/ui/Pagination";
import Spinner from "../../../components/ui/Spinner";
import StatusBadge from "../../../components/ui/StatusBadge";
import Button from "../../../components/ui/Button";
import { getPaymentLog, listPaymentLogs } from "../../../services/paymentLogService";
import { formatDate } from "../../../utils/date";
import { normalizeApiError } from "../../../utils/errors";
import { ROLES } from "../../../utils/constants";

export default function AdminPaymentLogsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, eventType: "", requestId: "" });
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
        const response = await listPaymentLogs(params);
        setData(response.data);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const view = async (id) => {
    const response = await getPaymentLog(id);
    setSelected(response.data);
  };

  return (
    <RoleGuard role={ROLES.ADMIN}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-ink">Payment logs</h1>
        <div className="grid gap-3 rounded-md border bg-white p-4 md:grid-cols-2"><Input id="eventType" label="Event type" value={filters.eventType} onChange={(event) => setFilters({ ...filters, eventType: event.target.value, page: 1 })} /><Input id="requestId" label="Request ID" value={filters.requestId} onChange={(event) => setFilters({ ...filters, requestId: event.target.value, page: 1 })} /></div>
        {loading ? <Spinner label="Loading payment logs" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {!loading && !error && data.items.length === 0 ? <EmptyState title="No payment logs" /> : null}
        {!loading && !error && data.items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="min-w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Event</th><th className="p-3">Payment</th><th className="p-3">Order</th><th className="p-3">Request</th><th className="p-3">Date</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y">{data.items.map((log) => <tr key={log.id}><td className="p-3"><StatusBadge status={log.event_type} /></td><td className="p-3">{log.payment_id || "N/A"}</td><td className="p-3">{log.order?.order_number || "N/A"}</td><td className="p-3">{log.request_id}</td><td className="p-3">{formatDate(log.created_at)}</td><td className="p-3"><Button type="button" variant="secondary" onClick={() => view(log.id)}>Details</Button></td></tr>)}</tbody></table>
            <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
          </div>
        ) : null}
        <Modal open={Boolean(selected)} title="Payment log details" onClose={() => setSelected(null)}>
          <dl className="space-y-2 text-sm"><div><dt className="font-medium text-slate-500">Event</dt><dd>{selected?.event_type}</dd></div><div><dt className="font-medium text-slate-500">Request ID</dt><dd>{selected?.request_id}</dd></div><div><dt className="font-medium text-slate-500">Source</dt><dd>{selected?.source}</dd></div><div><dt className="font-medium text-slate-500">Created</dt><dd>{formatDate(selected?.created_at)}</dd></div></dl>
          <p className="mt-4 text-xs text-slate-500">Raw secrets and card data are not displayed.</p>
        </Modal>
      </section>
    </RoleGuard>
  );
}

const colors = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  CONFIRMED: "border-sky-200 bg-sky-50 text-sky-800",
  PROCESSING: "border-indigo-200 bg-indigo-50 text-indigo-800",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CAPTURED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAILED: "border-red-200 bg-red-50 text-red-800",
  PAYMENT_FAILED: "border-red-200 bg-red-50 text-red-800",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-700",
  CREATED: "border-slate-200 bg-slate-100 text-slate-700",
  AUTHORIZED: "border-sky-200 bg-sky-50 text-sky-800",
  REFUNDED: "border-purple-200 bg-purple-50 text-purple-800",
  PARTIALLY_REFUNDED: "border-purple-200 bg-purple-50 text-purple-800",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${colors[status] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
    {(status || "UNKNOWN").replaceAll("_", " ")}
  </span>
);

export default StatusBadge;

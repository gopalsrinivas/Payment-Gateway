const EmptyState = ({ title = "Nothing here yet", message, action }) => (
  <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
    <h2 className="text-lg font-semibold text-ink">{title}</h2>
    {message && <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;

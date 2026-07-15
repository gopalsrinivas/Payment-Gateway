const Spinner = ({ label = "Loading" }) => (
  <div className="flex min-h-40 items-center justify-center" role="status" aria-live="polite">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
    <span className="ml-3 text-sm text-slate-600">{label}</span>
  </div>
);

export default Spinner;

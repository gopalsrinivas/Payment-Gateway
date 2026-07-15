const CustomerStatCard = ({ label, value, helper }) => (
  <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
  </div>
);

export default CustomerStatCard;

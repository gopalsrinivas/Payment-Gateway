const CustomerPageHeader = ({ eyebrow = "Shopping Portal", title, description, actions }) => (
  <div className="flex flex-col gap-4 rounded-md border border-emerald-100 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase text-brand">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);

export default CustomerPageHeader;

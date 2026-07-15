const FormField = ({ error, label, ...props }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
    <input
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand/20 transition focus:border-brand focus:ring-4"
      {...props}
    />
    {error ? <span className="mt-1 block text-sm text-red-700">{error}</span> : null}
  </label>
);

export default FormField;


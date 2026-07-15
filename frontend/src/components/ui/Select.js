import { getSafeErrorMessage } from "../../utils/errors";

const Select = ({ label, error, id, children, className = "", ...props }) => (
  <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
    {label && <span>{label}</span>}
    <select
      id={id}
      className={`mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
      aria-invalid={Boolean(error)}
      {...props}
    >
      {children}
    </select>
    {error && <span className="mt-1 block text-xs text-red-600">{getSafeErrorMessage(error)}</span>}
  </label>
);

export default Select;

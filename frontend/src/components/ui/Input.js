import { getSafeErrorMessage } from "../../utils/errors";

const Input = ({ label, error, id, className = "", ...props }) => (
  <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
    {label && <span>{label}</span>}
    <input
      id={id}
      className={`mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
    {error && (
      <span id={`${id}-error`} className="mt-1 block text-xs text-red-600">
        {getSafeErrorMessage(error)}
      </span>
    )}
  </label>
);

export default Input;

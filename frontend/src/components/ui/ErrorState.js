import { getSafeErrorMessage } from "../../utils/errors";

const ErrorState = ({ title = "Something went wrong", message, requestId, onRetry }) => {
  const safeTitle = getSafeErrorMessage(title);
  const safeMessage = message ? getSafeErrorMessage(message) : "";

  return (
  <div className="rounded-md border border-red-200 bg-red-50 p-6 text-red-900" role="alert">
    <h2 className="text-lg font-semibold">{safeTitle}</h2>
    {safeMessage && <p className="mt-2 text-sm">{safeMessage}</p>}
    {requestId && <p className="mt-2 text-xs text-red-700">Request ID: {requestId}</p>}
    {onRetry && (
      <button type="button" onClick={onRetry} className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
        Try again
      </button>
    )}
  </div>
  );
};

export default ErrorState;

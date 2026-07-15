"use client";

import ErrorState from "../components/ui/ErrorState";
import { getSafeErrorMessage } from "../utils/errors";

export default function Error({ error, reset }) {
  if (process.env.NODE_ENV === "development") {
    console.error("Frontend route error", getSafeErrorMessage(error));
  }
  return <ErrorState title="Page error" message={getSafeErrorMessage(error)} onRetry={reset} />;
}

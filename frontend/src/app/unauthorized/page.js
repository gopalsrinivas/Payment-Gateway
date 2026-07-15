import Link from "next/link";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";

export default function UnauthorizedPage() {
  return (
    <ErrorState
      title="Access restricted"
      message="You do not have permission to view that page."
      onRetry={null}
    />
  );
}

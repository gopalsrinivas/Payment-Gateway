import Link from "next/link";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

export default function NotFound() {
  return <EmptyState title="Page not found" message="The page you requested does not exist." action={<Button as={Link} href="/">Go home</Button>} />;
}

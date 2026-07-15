import Link from "next/link";
import Button from "../../components/ui/Button";

export default function PaymentFailedPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-md border border-red-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-red-800">Payment not completed</h1>
      <p className="mt-3 text-slate-600">
        No payment record is created from this page. Part 5 will connect safe gateway failure handling to backend verification.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} href="/orders">View orders</Button>
        <Button as={Link} href="/products" variant="secondary">Browse products</Button>
      </div>
    </section>
  );
}

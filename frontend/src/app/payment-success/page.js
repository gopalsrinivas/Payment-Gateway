import Link from "next/link";
import Button from "../../components/ui/Button";

export default function PaymentSuccessPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-md border border-emerald-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-emerald-800">Payment success foundation</h1>
      <p className="mt-3 text-slate-600">
        This page is ready for Part 5, but Part 4 does not mark payments successful from frontend state or URL query parameters.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} href="/orders">View orders</Button>
        <Button as={Link} href="/payments" variant="secondary">Payment history</Button>
      </div>
    </section>
  );
}

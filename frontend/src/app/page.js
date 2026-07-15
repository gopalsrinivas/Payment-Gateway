import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Part 1 Foundation</p>
        <h1 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">Payment Gateway Demo</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Register, log in, and access a protected dashboard while the backend stays ready for later Razorpay test-mode payment work.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-teal-800" href="/register">
            Create account
          </Link>
          <Link className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-800 hover:bg-white" href="/login">
            Sign in
          </Link>
        </div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Included now</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>JWT authentication</li>
          <li>Role-aware profile data</li>
          <li>Backend Razorpay SDK configuration foundation</li>
          <li>Webhook raw-body foundation</li>
        </ul>
      </div>
    </section>
  );
}


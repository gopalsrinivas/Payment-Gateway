import Link from "next/link";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/currency";

const CartSummary = ({ cart, checkout = true, disabled }) => (
  <aside className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-ink">Summary</h2>
    <dl className="mt-4 space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-slate-600">Items</dt>
        <dd className="font-medium text-ink">{cart.itemCount || 0}</dd>
      </div>
      <div className="flex justify-between border-t pt-3">
        <dt className="font-semibold text-ink">Backend total</dt>
        <dd className="font-semibold text-brand">{formatCurrency(cart.subtotal, cart.currency)}</dd>
      </div>
    </dl>
    {checkout && (
      <Button as={Link} href="/checkout" className="mt-5 w-full" disabled={disabled || !cart.items?.length}>
        Proceed to checkout
      </Button>
    )}
    <p className="mt-3 text-xs text-slate-500">Final order totals are calculated by the backend.</p>
  </aside>
);

export default CartSummary;

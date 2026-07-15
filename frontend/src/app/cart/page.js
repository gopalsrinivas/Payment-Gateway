"use client";

import Link from "next/link";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { useCart } from "../../contexts/CartContext";

export default function CartPage() {
  const { cart, cartLoading, mutating, updateItem, removeItem, clearCart } = useCart();

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ink">Cart</h1>
          <p className="mt-2 text-slate-600">Totals shown here come from the backend cart API.</p>
        </div>
        {cartLoading ? <Spinner label="Loading cart" /> : null}
        {!cartLoading && cart.items.length === 0 ? (
          <EmptyState title="Your cart is empty" message="Add a product to prepare a test order." action={<Button as={Link} href="/products">Browse products</Button>} />
        ) : null}
        {!cartLoading && cart.items.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {cart.items.map((item) => <CartItem key={item.id} item={item} disabled={mutating} onUpdate={updateItem} onRemove={removeItem} />)}
              <Button type="button" variant="secondary" disabled={mutating} onClick={clearCart}>Clear cart</Button>
            </div>
            <CartSummary cart={cart} disabled={mutating} />
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

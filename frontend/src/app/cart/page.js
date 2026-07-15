"use client";

import Link from "next/link";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { useCart } from "../../contexts/CartContext";

export default function CartPage() {
  const { cart, cartLoading, mutating, updateItem, removeItem, clearCart } = useCart();

  return (
    <ProtectedRoute>
      <section className="space-y-6">
        <CustomerPageHeader
          title="My Cart"
          description="Review quantities and backend-trusted totals before starting Razorpay Test Mode checkout."
          actions={<Button as={Link} href="/products" variant="secondary">Continue Shopping</Button>}
        />
        {cartLoading ? <Spinner label="Loading cart" /> : null}
        {!cartLoading && cart.items.length === 0 ? (
          <EmptyState title="Your cart is empty" message="Add a product to prepare a test order." action={<Button as={Link} href="/products">Browse products</Button>} />
        ) : null}
        {!cartLoading && cart.items.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {cart.items.map((item) => <CartItem key={item.id} item={item} disabled={mutating} onUpdate={updateItem} onRemove={removeItem} />)}
              <Button type="button" variant="danger" disabled={mutating} onClick={clearCart}>Clear Cart</Button>
            </div>
            <CartSummary cart={cart} disabled={mutating} />
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/currency";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { ROLES } from "../../utils/constants";
import { getRoleName } from "../../utils/auth";

const ProductCard = ({ product }) => {
  const { user, isAuthenticated } = useAuth();
  const { addItem, mutating } = useCart();
  const canAdd = isAuthenticated && getRoleName(user) === ROLES.CUSTOMER && product.isActive;
  const handleAdd = () => {
    addItem(product.id, 1).catch((error) => {
      if (error?.message === "A cart action is already in progress") toast.error(error.message);
    });
  };

  return (
    <article className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-md object-cover" /> : "Product image"}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs font-medium uppercase text-slate-500">{product.sku}</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">{product.name}</h2>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description || "No description provided."}</p>
        <p className="mt-3 text-xl font-semibold text-brand">{formatCurrency(product.price, product.currency)}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Button as={Link} href={`/products/${product.id}`} variant="secondary" className="flex-1">
            Details
          </Button>
          {canAdd ? (
            <Button type="button" disabled={mutating} onClick={handleAdd} aria-label={`Add ${product.name} to cart`}>
              <FiShoppingCart /> Add
            </Button>
          ) : (
            <Button as={Link} href={isAuthenticated ? `/products/${product.id}` : "/login"} variant="ghost">
              {isAuthenticated ? "View" : "Login"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

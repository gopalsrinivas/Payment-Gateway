"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import Spinner from "../../../components/ui/Spinner";
import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import { deleteProduct, getProduct, updateProductStatus } from "../../../services/productService";
import { formatCurrency } from "../../../utils/currency";
import { getErrorMessage, normalizeApiError } from "../../../utils/errors";
import { ROLES } from "../../../utils/constants";
import { getRoleName } from "../../../utils/auth";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addItem, mutating } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminMutating, setAdminMutating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProduct(id);
        setProduct(response.data.product);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const validateQuantity = () => {
    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1 || nextQuantity > 99) {
      toast.error("Quantity must be between 1 and 99");
      return null;
    }
    return nextQuantity;
  };

  const add = async () => {
    const nextQuantity = validateQuantity();
    if (!nextQuantity) return;
    try {
      await addItem(Number(id), nextQuantity);
    } catch (addError) {
      if (addError?.message === "A cart action is already in progress") toast.error(getErrorMessage(addError));
    }
  };

  const buyNow = async () => {
    const nextQuantity = validateQuantity();
    if (!nextQuantity) return;
    try {
      await addItem(Number(id), nextQuantity);
      router.push("/checkout");
    } catch (buyError) {
      if (buyError?.message === "A cart action is already in progress") toast.error(getErrorMessage(buyError));
    }
  };

  const adminToggleStatus = async () => {
    setAdminMutating(true);
    try {
      const response = await updateProductStatus(product.id, !product.isActive);
      setProduct(response.data.product);
      toast.success("Product status updated");
    } catch (statusError) {
      toast.error(getErrorMessage(statusError));
    } finally {
      setAdminMutating(false);
    }
  };

  const adminDelete = async () => {
    setAdminMutating(true);
    try {
      await deleteProduct(product.id);
      toast.success("Product soft-deleted");
      router.push("/admin/products");
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    } finally {
      setAdminMutating(false);
    }
  };

  if (loading) return <Spinner label="Loading product" />;
  if (error) return <ErrorState title="Product unavailable" message={error.message} requestId={error.requestId} />;

  const roleName = getRoleName(user);
  const canPurchase = isAuthenticated && roleName === ROLES.CUSTOMER && product?.isActive;
  const isAdmin = roleName === ROLES.ADMIN;

  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-md object-cover" /> : "Product image"}
      </div>
      <div>
        <p className="text-sm font-semibold uppercase text-brand">{product.sku}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{product.name}</h1>
        <p className="mt-4 text-slate-600">{product.description || "No description provided."}</p>
        <p className="mt-5 text-2xl font-semibold text-brand">{formatCurrency(product.price, product.currency)}</p>
        <p className="mt-2 text-sm text-slate-600">Availability: {product.isActive ? "Active" : "Inactive"}</p>
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-slate-700">
            Quantity
            <input type="number" min="1" max="99" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} className="mt-1 w-24 rounded-md border border-slate-300 px-3 py-2" />
          </label>
          {canPurchase ? (
            <>
              <Button type="button" disabled={mutating} onClick={add}>Add to Cart</Button>
              <Button type="button" disabled={mutating} onClick={buyNow} variant="secondary">Buy Now</Button>
            </>
          ) : isAdmin ? (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">Admin Product Preview</span>
              <Button as={Link} href={`/admin/products/${product.id}/edit`} variant="secondary">Edit Product</Button>
              <Button type="button" variant="secondary" disabled={adminMutating} onClick={adminToggleStatus}>
                {product.isActive ? "Deactivate Product" : "Activate Product"}
              </Button>
              <Button type="button" variant="danger" disabled={adminMutating} onClick={adminDelete}>Delete Product</Button>
            </div>
          ) : (
            <Button as={Link} href={isAuthenticated ? "/products" : `/login?next=/products/${id}`} variant="secondary">
              {isAuthenticated ? "Back to products" : "Login to add"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

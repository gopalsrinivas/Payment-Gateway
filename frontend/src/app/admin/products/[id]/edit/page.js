"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import RoleGuard from "../../../../../components/auth/RoleGuard";
import ProductForm from "../../../../../components/products/ProductForm";
import ErrorState from "../../../../../components/ui/ErrorState";
import Spinner from "../../../../../components/ui/Spinner";
import { getProduct, updateProduct } from "../../../../../services/productService";
import { getErrorMessage, normalizeApiError } from "../../../../../utils/errors";
import { ROLES } from "../../../../../utils/constants";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
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

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      await updateProduct(id, payload);
      toast.success("Product updated");
      router.push("/admin/products");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleGuard role={ROLES.ADMIN}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-ink">Edit product</h1>
        {loading ? <Spinner label="Loading product" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} /> : null}
        {product ? <ProductForm initialProduct={product} onSubmit={submit} submitting={submitting} /> : null}
      </section>
    </RoleGuard>
  );
}

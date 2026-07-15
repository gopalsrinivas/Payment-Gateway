"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import RoleGuard from "../../../../components/auth/RoleGuard";
import ProductForm from "../../../../components/products/ProductForm";
import { createProduct } from "../../../../services/productService";
import { getErrorMessage } from "../../../../utils/errors";
import { ROLES } from "../../../../utils/constants";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      await createProduct(payload);
      toast.success("Product created");
      router.push("/admin/products");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return <RoleGuard role={ROLES.ADMIN}><section className="space-y-6"><h1 className="text-3xl font-bold text-ink">Create product</h1><ProductForm onSubmit={submit} submitting={submitting} /></section></RoleGuard>;
}

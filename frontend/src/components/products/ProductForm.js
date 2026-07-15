"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const ProductForm = ({ initialProduct, onSubmit, submitting }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      description: "",
      price: "",
      currency: "INR",
      imageUrl: "",
      isActive: "true",
    },
  });

  useEffect(() => {
    if (initialProduct) {
      reset({
        name: initialProduct.name || "",
        slug: initialProduct.slug || "",
        sku: initialProduct.sku || "",
        description: initialProduct.description || "",
        price: initialProduct.price || "",
        currency: initialProduct.currency || "INR",
        imageUrl: initialProduct.imageUrl || "",
        isActive: String(initialProduct.isActive ?? true),
      });
    }
  }, [initialProduct, reset]);

  const submit = (values) =>
    onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim() || undefined,
      sku: values.sku.trim(),
      description: values.description.trim() || undefined,
      price: Number(values.price),
      currency: values.currency,
      imageUrl: values.imageUrl.trim() || undefined,
      isActive: values.isActive === "true",
    });

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 md:grid-cols-2">
      <Input id="name" label="Name" error={errors.name?.message} {...register("name", { required: "Product name is required", minLength: { value: 2, message: "Use at least 2 characters" } })} />
      <Input id="slug" label="Slug" error={errors.slug?.message} {...register("slug", { pattern: { value: /^[a-zA-Z0-9-]*$/, message: "Use letters, numbers, and hyphens" } })} />
      <Input id="sku" label="SKU" error={errors.sku?.message} {...register("sku", { required: "SKU is required" })} />
      <Input id="price" label="Price" type="number" step="0.01" min="0.01" error={errors.price?.message} {...register("price", { required: "Price is required", min: { value: 0.01, message: "Price must be positive" } })} />
      <Select id="currency" label="Currency" {...register("currency")}>
        <option value="INR">INR</option>
      </Select>
      <Select id="isActive" label="Status" {...register("isActive")}>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </Select>
      <Input id="imageUrl" label="Image URL" type="url" error={errors.imageUrl?.message} {...register("imageUrl", { pattern: { value: /^https?:\/\/.+/i, message: "Enter a valid http(s) URL" } })} />
      <label className="block text-sm font-medium text-slate-700 md:col-span-2" htmlFor="description">
        Description
        <textarea id="description" rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" {...register("description")} />
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import RoleGuard from "../../../components/auth/RoleGuard";
import ProductFilters from "../../../components/products/ProductFilters";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import Modal from "../../../components/ui/Modal";
import Pagination from "../../../components/ui/Pagination";
import Spinner from "../../../components/ui/Spinner";
import { deleteProduct, listProducts, updateProductStatus } from "../../../services/productService";
import { formatCurrency } from "../../../utils/currency";
import { normalizeApiError, getErrorMessage } from "../../../utils/errors";
import { ROLES } from "../../../utils/constants";

export default function AdminProductsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "", sortBy: "created_at", sortOrder: "DESC", isActive: "" });
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, includeInactive: true };
      if (params.isActive === "") delete params.isActive;
      const response = await listProducts(params);
      setData(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const toggle = async (product) => {
    try {
      await updateProductStatus(product.id, !product.isActive);
      toast.success("Product status updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async () => {
    try {
      await deleteProduct(confirmDelete.id);
      toast.success("Product soft-deleted");
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <RoleGuard role={ROLES.ADMIN}>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-ink">Admin products</h1>
          <Button as={Link} href="/admin/products/new">Create product</Button>
        </div>
        <ProductFilters admin filters={filters} onChange={(patch) => setFilters({ ...filters, ...patch })} onReset={() => setFilters({ page: 1, limit: 10, search: "", sortBy: "created_at", sortOrder: "DESC", isActive: "" })} />
        {loading ? <Spinner label="Loading products" /> : null}
        {error ? <ErrorState message={error.message} requestId={error.requestId} onRetry={load} /> : null}
        {!loading && !error && data.items.length === 0 ? <EmptyState title="No products" /> : null}
        {!loading && !error && data.items.length > 0 ? (
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3">Name</th><th className="p-3">SKU</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody className="divide-y">
                {data.items.map((product) => (
                  <tr key={product.id}>
                    <td className="p-3 font-medium">{product.name}</td><td className="p-3">{product.sku}</td><td className="p-3">{formatCurrency(product.price, product.currency)}</td><td className="p-3">{product.isActive ? "Active" : "Inactive"}</td>
                    <td className="flex flex-wrap gap-2 p-3"><Button as={Link} href={`/admin/products/${product.id}/edit`} variant="secondary">Edit</Button><Button type="button" variant="secondary" onClick={() => toggle(product)}>{product.isActive ? "Deactivate" : "Activate"}</Button><Button type="button" variant="danger" onClick={() => setConfirmDelete(product)}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination pagination={data.pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
          </div>
        ) : null}
        <Modal open={Boolean(confirmDelete)} title="Delete product" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-slate-600">This will soft-delete {confirmDelete?.name}. The backend remains the source of truth.</p>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button><Button type="button" variant="danger" onClick={remove}>Delete</Button></div>
        </Modal>
      </section>
    </RoleGuard>
  );
}

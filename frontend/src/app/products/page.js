"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../components/products/ProductCard";
import ProductFilters from "../../components/products/ProductFilters";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";
import { listProducts } from "../../services/productService";
import { useDebounce } from "../../hooks/useDebounce";
import { normalizeApiError } from "../../utils/errors";

export default function ProductsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 9, search: "", sortBy: "created_at", sortOrder: "DESC" });
  const debouncedSearch = useDebounce(filters.search);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listProducts({ ...filters, search: debouncedSearch });
        setData(response.data);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, debouncedSearch]);

  const updateFilters = (patch) => setFilters((current) => ({ ...current, ...patch }));
  const reset = () => setFilters({ page: 1, limit: 9, search: "", sortBy: "created_at", sortOrder: "DESC" });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Products</h1>
        <p className="mt-2 text-slate-600">Browse active demo products. Checkout totals remain backend-trusted.</p>
      </div>
      <ProductFilters filters={filters} onChange={updateFilters} onReset={reset} />
      {loading ? <Spinner label="Loading products" /> : null}
      {error ? <ErrorState message={error.message} requestId={error.requestId} onRetry={() => updateFilters({ page: filters.page })} /> : null}
      {!loading && !error && data.items.length === 0 ? <EmptyState title="No products found" message="Try changing the search or sort filters." /> : null}
      {!loading && !error && data.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          <Pagination pagination={data.pagination} onPageChange={(page) => updateFilters({ page })} />
        </>
      ) : null}
    </section>
  );
}

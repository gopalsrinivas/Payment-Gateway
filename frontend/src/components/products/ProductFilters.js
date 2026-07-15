"use client";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

const ProductFilters = ({ filters, onChange, onReset, admin = false }) => (
  <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_160px_120px]">
    <Input id="search" label="Search" value={filters.search} onChange={(event) => onChange({ search: event.target.value, page: 1 })} placeholder="Name, SKU, description" />
    <Select id="sortBy" label="Sort by" value={filters.sortBy} onChange={(event) => onChange({ sortBy: event.target.value })}>
      <option value="created_at">Newest</option>
      <option value="name">Name</option>
      <option value="price">Price</option>
    </Select>
    <Select id="sortOrder" label="Order" value={filters.sortOrder} onChange={(event) => onChange({ sortOrder: event.target.value })}>
      <option value="DESC">Descending</option>
      <option value="ASC">Ascending</option>
    </Select>
    {admin ? (
      <Select id="isActive" label="Status" value={filters.isActive} onChange={(event) => onChange({ isActive: event.target.value, page: 1 })}>
        <option value="">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </Select>
    ) : (
      <div className="flex items-end">
        <Button type="button" variant="secondary" onClick={onReset} className="w-full">
          Reset
        </Button>
      </div>
    )}
    {admin && (
      <div className="flex items-end md:col-span-4">
        <Button type="button" variant="secondary" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    )}
  </div>
);

export default ProductFilters;

export const ROLES = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
};

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED", "FAILED"];
export const PAYMENT_STATUSES = ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"];

export const SORT_FIELDS = [
  { label: "Newest", value: "created_at" },
  { label: "Name", value: "name" },
  { label: "Price", value: "price" },
];

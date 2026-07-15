"use client";

import Button from "../ui/Button";
import { formatCurrency } from "../../utils/currency";

const CartItem = ({ item, onUpdate, onRemove, disabled }) => (
  <article className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-[1fr_120px_140px_120px] md:items-center">
    <div>
      <p className="font-semibold text-ink">{item.productName}</p>
      <p className="text-sm text-slate-500">{item.productSku}</p>
      <p className="mt-1 text-sm text-slate-600">{formatCurrency(item.unitPrice, item.currency)} each</p>
    </div>
    <label className="text-sm font-medium text-slate-700">
      Quantity
      <input
        type="number"
        min="1"
        max="99"
        value={item.quantity}
        disabled={disabled}
        onChange={(event) => onUpdate(item.id, Number(event.target.value))}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
      />
    </label>
    <p className="font-semibold text-ink">{formatCurrency(item.lineTotal, item.currency)}</p>
    <Button type="button" variant="secondary" disabled={disabled} onClick={() => onRemove(item.id)}>
      Remove
    </Button>
  </article>
);

export default CartItem;

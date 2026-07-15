"use client";

import Button from "../ui/Button";

const PaymentButton = ({ disabled, loading, onClick }) => (
  <Button type="button" disabled={disabled || loading} onClick={onClick} className="w-full">
    {loading ? "Processing..." : "Pay with Razorpay"}
  </Button>
);

export default PaymentButton;
